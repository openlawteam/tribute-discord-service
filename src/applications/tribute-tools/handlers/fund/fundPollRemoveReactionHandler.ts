import {
  MessageReaction,
  PartialMessageReaction,
  PartialUser,
  User,
} from 'discord.js';

import {THUMBS_EMOJIS} from '../../config';
import {prisma} from '../../../../singletons';

export async function fundPollRemoveReactionHandler({
  reaction,
  user,
}: {
  reaction: MessageReaction | PartialMessageReaction;
  user: User | PartialUser;
}) {
  try {
    // Exit if bot added the reaction (initial reactions on poll creation)
    if (user.bot) return;

    /**
     * When a reaction is received, check if the structure is partial
     * as we may need to `fetch` it, so it can be added to the cache.
     */
    if (reaction.partial) {
      // Fetch the message to add it to the cache
      await reaction.fetch();
    }

    const pollEntry = await prisma.fundAddressPoll.findUnique({
      where: {
        messageID: reaction.message.id,
      },
    });

    // Exit if this is not a poll message
    if (!pollEntry) {
      return;
    }

    const {processed, upvoteCount, voteThreshold} = pollEntry;

    /**
     * Handle removal of upvote
     */
    if (
      !processed &&
      voteThreshold > upvoteCount &&
      (reaction.emoji.name as typeof THUMBS_EMOJIS[number]) === '👍'
    ) {
      // Subtract from upvote tally in db
      await prisma.fundAddressPoll.update({
        where: {
          messageID: reaction.message.id,
        },
        data: {
          upvoteCount: pollEntry.upvoteCount - 1,
        },
      });
    }
  } catch (error) {
    console.error(
      `Something went wrong while handling a removed Discord reaction: ${error}`
    );
  }
}
