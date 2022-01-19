import {
  Client,
  DiscordAPIError,
  Intents,
  Message,
  TextChannel,
} from 'discord.js';
import {Prisma} from '@prisma/client';

import {ApplicationReturn} from '../types';
import {deployCommands, destroyClientHandler, getCommands} from '../helpers/';
import {FLOOR_SWEEPER_POLL_BOT_ID} from '../../config';
import {getEnv} from '../../helpers';
import {prisma} from '../../singletons';

const CHECK_POLL_ENDED_INTERVAL: number = 15000;

export async function floorSweeperPollBot(): Promise<ApplicationReturn | void> {
  try {
    if (!getEnv('BOT_TOKEN_FLOOR_SWEEPER_POLL')) {
      return;
    }

    const commands = await getCommands(async () => await import('./commands'));

    // Deploy commands
    try {
      deployCommands({
        applicationID: FLOOR_SWEEPER_POLL_BOT_ID,
        commands,
        name: 'FLOOR_SWEEPER_POLL_BOT',
        tokenEnvVarName: 'BOT_TOKEN_FLOOR_SWEEPER_POLL',
      });
    } catch (error) {
      console.error(
        `Discord commands for FLOOR_SWEEPER_POLL_BOT could not be deployed. ${error}`
      );

      return;
    }

    // Create a new Discord client instance
    const client = new Client({
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
      ],
      partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
    });

    // Login to Discord with the bot's token
    client.login(getEnv('BOT_TOKEN_FLOOR_SWEEPER_POLL'));

    // When the Discord client is ready, run this code (only once)
    client.once('ready', async () => {
      console.log('🤖  Floor sweeper bot ready');

      // Poll every x seconds to check for ended polls and process them
      setInterval(async () => {
        // Get ended, unprocessed polls
        const endedPolls = await prisma.floorSweeperPoll.findMany({
          where: {dateEnd: {lt: new Date()}, processed: false},
        });

        endedPolls.forEach(async ({channelID, id, messageID, options}) => {
          try {
            const channel = (await client.channels.fetch(
              channelID
            )) as TextChannel;

            let message: Message;

            try {
              message = await channel.messages.fetch(messageID);
            } catch (error) {
              const e = error as DiscordAPIError;

              // Prune old db entries, if a Discord message has been deleted
              if (e.httpStatus === 404) {
                await prisma.floorSweeperPoll.delete({
                  where: {
                    messageID,
                  },
                });

                return;
              }

              console.error(
                `Something went wrong while fetching Discord message ID ${messageID}. ${e}`
              );

              return;
            }

            /**
             * Tally results
             *
             * if tie, take choice with lower amount
             */
            console.log('*************************');
            console.log(message.content);
            message.reactions.cache.forEach((m) => {
              console.log('---POLL_RESULTS---', m.emoji.name, m.count - 1);
            });

            const messageReactions = message.reactions.cache;
            // Get largest count of reactions
            const reactionsLargestCount = Math.max(
              ...messageReactions.map((mr) => mr.count - 1)
            );
            // Create array of reaction emojis that had largest count
            const reactionsWithLargestCount = messageReactions
              .filter((mr) => mr.count - 1 === reactionsLargestCount)
              .map((f) => f.emoji.name);
            // Filter `options` to get only options that had largest count
            const optionsWithLargestCount = Object.fromEntries(
              Object.entries(options as Prisma.JsonObject).filter(([key]) =>
                reactionsWithLargestCount.includes(key)
              )
            );
            // Get values of `options` that had largest count and convert to
            // number (if value was 'None' then convert to `0`)
            const optionWithLargestCountValuesToCompare = Object.values(
              optionsWithLargestCount
            ).map((v) => (v === 'None' ? 0 : Number(v)));
            // Get lowest value to handle tie where more than one option had the
            // largest count
            const result: number = Math.min(
              ...optionWithLargestCountValuesToCompare
            );

            // Mark the poll as `processed: true` in the db
            await prisma.floorSweeperPoll.update({
              where: {
                id,
              },
              data: {
                result,
                processed: true,
              },
            });

            /**
             * Notify poll channel that the poll has ended
             * @todo add DAO config for Discord `guildID` and floor sweeper
             * config channelID
             * @todo show link to sweep channel message in poll ended message
             */
            const resultText =
              result > 0
                ? `The result was **${result} ETH**. To sweep, go to #<CHANNEL>.`
                : 'The result was **None**.';

            await message.reply(`The poll has ended. ${resultText}`);

            // @todo Send message to configured channel
          } catch (error) {
            console.error(
              `There was an error while processing an ended poll: ${error}`
            );
          }
        });
      }, CHECK_POLL_ENDED_INTERVAL);
    });

    // Listen for interactions and possibly run commands
    client.on('interactionCreate', async (interaction) => {
      if (!interaction.isCommand()) return;

      const command = commands.commandsCollection.get(interaction.commandName);

      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);

        await interaction.followUp({
          content: 'There was an error while executing this command.',
          ephemeral: true,
        });
      }
    });

    // Listen to reactions on messages and possibly handle
    client.on('messageReactionAdd', async (reaction, user) => {
      // Exit if bot added the reaction (initial reactions on poll creation)
      if (user.bot) return;

      let isPartialOriginal: boolean = reaction.partial;

      /**
       * When a reaction is received, check if the structure is partial
       * as we may need to `fetch` it, so it can be added to the cache.
       */
      if (reaction.partial) {
        try {
          // Fetch the message to add it to the cache
          await reaction.fetch();
        } catch (error) {
          console.error(
            `There was an error while fetching the message: ${error}`
          );

          return;
        }
      }

      const pollEntry = await prisma.floorSweeperPoll.findUnique({
        where: {
          messageID: reaction.message.id,
        },
      });

      // Exit if this is not a poll message
      if (!pollEntry) {
        return;
      }

      /**
       * If it was a `partial` and it was `fetch`ed, it is not a `partial`, anymore.
       *
       * We `fetch` here because we may have exited the function early.
       */
      if (isPartialOriginal) {
        try {
          await Promise.all(
            reaction.message.reactions.cache.map(
              async (r) => await r.users.fetch()
            )
          );
        } catch (error) {
          console.error(
            `There was an error while fetching the reactions users: ${error}`
          );

          return;
        }
      }

      const isValidEmoji: boolean = Object.keys(
        pollEntry.options as Prisma.JsonObject
      ).some((name) => name === reaction.emoji.name);

      // If the emoji is not from the poll entry's options, remove it.
      if (!isValidEmoji) {
        try {
          await reaction.users.remove(user.id);

          return;
        } catch (error) {
          console.error(
            `There was an error while removing user's invalid reaction: ${error}`
          );

          return;
        }
      }

      /**
       * On poll end, remove any late reactions and DM the user the error/help
       * message, as we don't have access to send channel-based ephemeral
       * messages within this event's callback
       *
       * @todo show link to sweep channel message in direct message when user
       * tries to vote after poll ends
       */
      if (pollEntry.dateEnd < new Date()) {
        await reaction.users.remove(user.id);

        const result = pollEntry.result;
        const resultText =
          result > 0
            ? `The result was **${result} ETH**. To sweep, go to #<CHANNEL>.`
            : 'The result was **None**.';

        await user.send(
          `The poll has ended for *${pollEntry.question}*. ${resultText}`
        );

        return;
      }

      /**
       * Limit user to 1 reaction per message (1 vote per poll);
       * take the current reaction from the user and remove the rest.
       */
      reaction.message.reactions.cache.forEach(async (r) => {
        if (
          r.emoji.name !== reaction.emoji.name &&
          r.users.cache.has(user.id)
        ) {
          try {
            await r.users.remove(user.id);
          } catch (error) {
            console.error(
              `There was an error while removing user's old reaction: ${error}`
            );
          }
        }
      });
    });

    const stop = async () => {
      await destroyClientHandler(client, 'FLOOR_SWEEPER_POLL_BOT');
    };

    return {
      name: 'FLOOR_SWEEPER_POLL_BOT',
      stop,
    };
  } catch (error) {
    console.error(error);
  }
}
