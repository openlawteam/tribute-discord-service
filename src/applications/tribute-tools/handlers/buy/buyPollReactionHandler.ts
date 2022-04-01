import {
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  MessageReaction,
  PartialMessageReaction,
  PartialUser,
  TextChannel,
  User,
} from 'discord.js';
import {channelMention, time} from '@discordjs/builders';
import {fromWei, toBN} from 'web3-utils';

import {getDaoDiscordConfigs} from '../../../../services';
import {getDiscordDataByGuildID} from '../../../../helpers';
import {prisma} from '../../../../singletons';
import {THUMBS_EMOJIS, BUY_EXTERNAL_URL} from '../../config';

export async function buyPollReactionHandler({
  reaction,
  user,
}: {
  reaction: MessageReaction | PartialMessageReaction;
  user: User | PartialUser;
}): Promise<void> {
  try {
    // Exit if bot added the reaction (initial reactions on poll creation)
    if (user.bot) return;

    const isPartialOriginal: boolean = reaction.partial;

    /**
     * When a reaction is received, check if the structure is partial
     * as we may need to `fetch` it, so it can be added to the cache.
     */
    if (reaction.partial) {
      // Fetch the message to add it to the cache
      await reaction.fetch();
    }

    const pollEntry = await prisma.buyNFTPoll.findUnique({
      where: {
        messageID: reaction.message.id,
      },
    });

    // Exit if this is not a poll message
    if (!pollEntry) {
      return;
    }

    const {processed} = pollEntry;

    /**
     * If it was a `partial` and it was `fetch`ed, it is not a `partial`, anymore.
     *
     * We `fetch` here because we may have exited the function early.
     */
    if (isPartialOriginal) {
      await Promise.all(
        reaction.message.reactions.cache.map(async (r) => await r.users.fetch())
      );
    }

    const isValidEmoji: boolean = THUMBS_EMOJIS.some(
      (name) => name === reaction.emoji.name
    );

    // If the emoji is not from `THUMBS_EMOJIS`, remove it.
    if (!isValidEmoji) {
      await reaction.users.remove(user.id);

      return;
    }

    /**
     * If the poll has ended, remove any late reactions and DM the user the error/help
     * message, as we don't have access to send channel-based ephemeral
     * messages within this event's callback
     */
    if (processed) {
      try {
        await reaction.users.remove(user.id);
      } catch (error) {
        console.error(error);
      }

      const dao = getDiscordDataByGuildID(
        pollEntry.guildID,
        await getDaoDiscordConfigs()
      );

      if (!dao) {
        throw new Error(
          `Could not find DAO by \'guildID\' ${pollEntry.guildID}`
        );
      }

      const resultChannelID =
        dao.applications?.TRIBUTE_TOOLS_BOT?.commands.BUY.resultChannelID;

      if (!resultChannelID) {
        throw new Error('Could not find a `resultChannelID`.');
      }

      // DM the user that the poll has ended
      await user.send(
        `The poll has ended for *${
          pollEntry.name
        }*, because the number of required upvotes has been reached. To purchase, go to ${channelMention(
          resultChannelID
        )}.`
      );

      return;
    }

    /**
     * Limit user to 1 reaction per message (1 vote per poll);
     * take the current reaction from the user and remove the rest.
     */
    reaction.message.reactions.cache.forEach(async (r) => {
      if (r.emoji.name !== reaction.emoji.name && r.users.cache.has(user.id)) {
        try {
          await r.users.remove(user.id);
        } catch (error) {
          console.error(
            `There was an error while removing user's old reaction: ${error}`
          );
        }
      }
    });

    const {
      amountWEI,
      channelID,
      contractAddress,
      guildID,
      messageID,
      name,
      tokenID,
      upvoteCount,
      uuid,
      voteThreshold,
    } = pollEntry;

    /**
     * Handle upvote
     */
    if (
      !processed &&
      voteThreshold > upvoteCount &&
      (reaction.emoji.name as typeof THUMBS_EMOJIS[number]) === '👍'
    ) {
      // Add to upvote tally in db
      await prisma.buyNFTPoll.update({
        where: {
          messageID: reaction.message.id,
        },
        data: {
          upvoteCount: upvoteCount + 1,
        },
      });

      /**
       * Handle upvote when threshold will be reached.
       * Send message to the result channel.
       */
      if (voteThreshold - upvoteCount === 1) {
        // Mark entry as `processed: true`
        await prisma.buyNFTPoll.update({
          where: {
            messageID: reaction.message.id,
          },
          data: {
            processed: true,
          },
        });

        const dao = getDiscordDataByGuildID(
          guildID,
          await getDaoDiscordConfigs()
        );

        if (!dao) {
          throw new Error(`Could not find DAO by \'guildID\' ${guildID}`);
        }

        const resultChannelID =
          dao.applications?.TRIBUTE_TOOLS_BOT?.commands.BUY.resultChannelID;

        if (!resultChannelID) {
          throw new Error('Could not find a `resultChannelID`.');
        }

        const resultChannel = (await reaction.client.channels.fetch(
          resultChannelID
        )) as TextChannel;

        const buyButton = new MessageActionRow().addComponents(
          new MessageButton()
            .setLabel('Buy')
            .setStyle('LINK')
            .setURL(
              `${BUY_EXTERNAL_URL}/?daoName=${dao.internalName}&tokenId=${tokenID}&contractAddress=${contractAddress}&id=${uuid}&price=${amountWEI}`
            )
            .setEmoji('💸')
        );

        const content: string = `The poll for "*${name}*" @ ${fromWei(
          toBN(amountWEI.toString()),
          'ether'
        )} ETH ended ${time(
          Math.floor(Date.now() / 1000),
          'R'
        )}. The threshold of ${voteThreshold} vote${
          voteThreshold > 1 ? 's' : ''
        } has been reached.`;

        // Send message to the result channel with the buy button
        const buyChannelMessage = await resultChannel.send({
          content,
          components: [buyButton],
        });

        const pollEndEmbed = new MessageEmbed()
          .setTitle('Buy')
          .setURL(buyChannelMessage?.url || '')
          .setDescription(content);

        // Get original poll message and reply to it in the same channel
        const channel = (await reaction.client.channels.fetch(
          channelID
        )) as TextChannel;

        const message = await channel.messages.fetch(messageID);

        // Notify poll channel that the poll has ended
        await message.reply({
          embeds: [pollEndEmbed],
        });

        /**
         * Store result channel message ID in database.
         *
         * Placing at end in case of failure, the rest of the flow will work.
         * This message ID is needed for later to report transaction status to the result channel.
         */
        await prisma.buyNFTPoll.update({
          where: {
            messageID: reaction.message.id,
          },
          data: {
            actionMessageID: buyChannelMessage.id,
          },
        });
      }
    }
  } catch (error) {
    console.error(
      `Something went wrong while handling the Discord reaction: ${error}`
    );
  }
}
