import {Client, Intents, TextChannel} from 'discord.js';

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
    deployCommands({
      applicationID: FLOOR_SWEEPER_POLL_BOT_ID,
      commands,
      name: 'FLOOR_SWEEPER_POLL_BOT',
      tokenEnvVarName: 'BOT_TOKEN_FLOOR_SWEEPER_POLL',
    });

    // Create a new Discord client instance
    const client = new Client({
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
      ],
    });

    // When the Discord client is ready, run this code (only once)
    client.once('ready', async () => {
      console.log('Floor sweeper bot ready!');

      // Poll every x seconds to check for ended polls and process them
      setInterval(async () => {
        const endedPolls = await prisma.floorSweeperPoll.findMany({
          where: {dateEnd: {lt: new Date()}, processed: false},
        });

        endedPolls.forEach(async ({channelID, id, messageID, processed}) => {
          try {
            const channel = (await client.channels.fetch(
              channelID
            )) as TextChannel;

            const message = await channel.messages.fetch(messageID);

            // @todo tally results
            // @todo logic if 0 won
            // @todo logic if results > 0 && tie, take lower amount
            message.reactions.cache.forEach((m) => {
              console.log('---POLL_RESULTS---', m.emoji.name, m.count - 1);
            });

            // @todo result
            const result: number = 123;

            // Notify poll channel that the poll has ended
            // @todo add result
            // @todo add DAO config for Discord `guildID` and floor sweeper config channelID
            message.reply(
              'The poll has ended. The result was <RESULT>. To sweep, go to #<CHANNEL>.'
            );

            // @todo Send message to configured channel

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
          } catch (error) {
            console.error(
              `There was an error while processing an ended poll: ${error}`
            );
          }
        });
      }, CHECK_POLL_ENDED_INTERVAL);
    });

    // Login to Discord with the bot's token
    client.login(getEnv('BOT_TOKEN_FLOOR_SWEEPER_POLL'));

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
