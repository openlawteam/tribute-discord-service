import {
  MessageReaction,
  PartialMessageReaction,
  PartialUser,
  User,
} from 'discord.js';
import {Prisma} from '@prisma/client';
import {channelMention} from '@discordjs/builders';

import {getDaoDataByGuildID} from '../../../../helpers';
import {getDaos} from '../../../../services';
import {prisma} from '../../../../singletons';

export async function sweepPollReactionHandler({
  reaction,
  user,
}: {
  reaction: MessageReaction | PartialMessageReaction;
  user: User | PartialUser;
}): Promise<void> {
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
      console.error(`There was an error while fetching the message: ${error}`);

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
        reaction.message.reactions.cache.map(async (r) => await r.users.fetch())
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
   * If the poll has ended, remove any late reactions and DM the user the error/help
   * message, as we don't have access to send channel-based ephemeral
   * messages within this event's callback
   */
  if (pollEntry.dateEnd < new Date()) {
    await reaction.users.remove(user.id);

    const {processed, result} = pollEntry;

    let resultChannelID: string | undefined;

    if (result > 0) {
      const dao = getDaoDataByGuildID(pollEntry.guildID, await getDaos());

      if (!dao) {
        throw new Error(
          `Could not find DAO by \'guildID\' ${pollEntry.guildID}`
        );
      }

      resultChannelID = dao.applications?.TRIBUTE_TOOLS_BOT?.resultChannelID;

      if (!resultChannelID) {
        throw new Error('Could not find a `resultChannelID`.');
      }
    }

    const resultText =
      result > 0 && processed && resultChannelID
        ? `The result was **${result} ETH**. To sweep, go to ${channelMention(
            resultChannelID
          )}.`
        : !result && !processed
        ? `The result has not yet been processed.`
        : 'The result was **None**.';

    // DM the user that the poll has ended
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
}
