import {
  MessageReaction,
  PartialMessageReaction,
  PartialUser,
  User,
} from 'discord.js';
import {channelMention} from '@discordjs/builders';

import {BUY_ALLOWED_EMOJIS} from '../../config';
import {getDaoDataByGuildID} from '../../../../helpers';
import {getDaos} from '../../../../services';
import {prisma} from '../../../../singletons';

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

    const isValidEmoji: boolean = BUY_ALLOWED_EMOJIS.some(
      (name) => name === reaction.emoji.name
    );

    // If the emoji is not from `BUY_ALLOWED_EMOJIS`, remove it.
    if (!isValidEmoji) {
      await reaction.users.remove(user.id);

      return;
    }

    /**
     * If the poll has ended, remove any late reactions and DM the user the error/help
     * message, as we don't have access to send channel-based ephemeral
     * messages within this event's callback
     */
    if (pollEntry.processed) {
      try {
        await reaction.users.remove(user.id);
      } catch (error) {
        console.error(error);
      }

      const dao = getDaoDataByGuildID(pollEntry.guildID, await getDaos());

      if (!dao) {
        throw new Error(
          `Could not find DAO by \'guildID\' ${pollEntry.guildID}`
        );
      }

      const resultChannelID = (dao as any).applications?.TRIBUTE_TOOLS_BOT
        ?.commands.SWEEP.resultChannelID;

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
  } catch (error) {
    console.error(
      `Something went wrong while handling the Discord reaction: ${error}`
    );
  }
}
