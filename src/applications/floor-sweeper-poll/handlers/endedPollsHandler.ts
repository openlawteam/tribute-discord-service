import {
  Client,
  DiscordAPIError,
  Message,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  TextChannel,
} from 'discord.js';
import {Prisma} from '.prisma/client';
import {time} from '@discordjs/builders';

import {getDaoDataByGuildID} from '../../../helpers';
import {getDaos} from '../../../services';
import {prisma} from '../../../singletons';
import {SWEEP_EXTERNAL_URL} from '../config';

const CHECK_POLL_ENDED_INTERVAL: number = 15000;

export function endedPollsHandler({
  checkInterval = CHECK_POLL_ENDED_INTERVAL,
  client,
}: {
  checkInterval?: number;
  client: Client;
}): NodeJS.Timeout {
  // Poll every x seconds to check for ended polls and process them
  return setInterval(async () => {
    // Get ended, unprocessed polls
    const endedPolls = await prisma.floorSweeperPoll.findMany({
      where: {dateEnd: {lt: new Date()}, processed: false},
    });

    endedPolls.forEach(
      async ({
        channelID,
        contractAddress,
        dateEnd,
        guildID,
        id,
        messageID,
        options,
        question,
      }) => {
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
           * If a tie occurs, take the choice with lower amount.
           */
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

          /**
           * Get values of `options` that had largest count and convert to
           * number (if value was 'None' then convert to `0`)
           */
          const optionWithLargestCountValuesToCompare = Object.values(
            optionsWithLargestCount
          ).map((v) => (v === 'None' ? 0 : Number(v)));

          /**
           * Get lowest value to handle tie where more than one option had the
           * largest count
           */
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

          const pollEndMessageBase: string = `The poll "*${question}*" ended ${time(
            dateEnd,
            'R'
          )}.`;

          let sweepChannelMessage: Message | undefined = undefined;

          if (result > 0) {
            const dao = getDaoDataByGuildID(guildID, await getDaos());

            if (!dao) {
              throw new Error(`Could not find DAO by \'guildID\' ${guildID}`);
            }

            const resultChannelID =
              dao.applications?.FLOOR_SWEEPER_POLL_BOT?.resultChannelID;

            if (!resultChannelID) {
              throw new Error('Could not find a `resultChannelID`.');
            }

            const resultChannel = (await client.channels.fetch(
              resultChannelID
            )) as TextChannel;

            const sweepButton = new MessageActionRow().addComponents(
              new MessageButton()
                .setLabel('Sweep')
                .setStyle('LINK')
                .setURL(
                  `${SWEEP_EXTERNAL_URL}/?amount=${result}&contractAddress=${contractAddress}`
                )
                .setEmoji('🧹')
            );

            // Send message to the result channel with the sweep button
            sweepChannelMessage = await resultChannel.send({
              content: `${pollEndMessageBase} The result was **${result} ETH**.`,
              components: [sweepButton],
            });
          }

          const pollResultText =
            result > 0
              ? `The result was **${result} ETH**.`
              : 'The result was **None**.';

          const pollEndEmbed = new MessageEmbed()
            .setTitle('Sweep')
            .setURL(sweepChannelMessage?.url || '')
            .setDescription(`${pollEndMessageBase} ${pollResultText}`);

          // Notify poll channel that the poll has ended
          await message.reply({
            embeds: [pollEndEmbed],
          });
        } catch (error) {
          console.error(
            `There was an error while processing an ended poll: ${error}`
          );
        }
      }
    );
  }, checkInterval);
}
