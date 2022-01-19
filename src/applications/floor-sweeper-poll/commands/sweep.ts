import {
  bold,
  SlashCommandBuilder,
  SlashCommandIntegerOption,
  time,
} from '@discordjs/builders';
import {
  CommandInteraction,
  CommandInteractionOption,
  Message,
  MessageEmbed,
} from 'discord.js';
import dayjs from 'dayjs';
import duration, {DurationUnitType} from 'dayjs/plugin/duration';

import {
  NO_ENTRY_SIGN_EMOJI,
  POLL_REACTION_EMOJIS,
  REGIONAL_INDICATOR_PREFIX,
} from '../config';
import {Command} from '../../types';
import {normalizeString} from '../../../helpers';
import {PollEmojiOptions, PollOptionLetters} from '../types';
import {prisma, web3} from '../../../singletons';

// Add dayjs duration extension
dayjs.extend(duration);

const COMMAND_NAME: string = 'sweep';

const COMMAND_DESCRIPTION: string =
  "Creates a poll for sweeping an NFT collection's floor.";

const ARG_NAMES = {
  howLong: 'how_long',
  nftContract: 'nft_contract',
  question: 'question',
};

const OPTION_REGEX: RegExp = /^option_/;

const NONE_OPTION: 'None' = 'None';

const DURATION_PARSE_ERROR_MESSAGE: string =
  'Invalid duration. Try something like: 20 minutes; 12 hours; 1 day; 1 week. Short: d,w,M,y,h,m,s,ms';

const INVALID_ETH_ADDRESS_ERROR_MESSAGE: string =
  'Invalid Ethereum address. Try something like: 0x000000000000000000000000000000000000bEEF.';

function getOptionLetter(o: CommandInteractionOption): PollOptionLetters {
  return normalizeString(o.name.split(OPTION_REGEX)[1]) as PollOptionLetters;
}

function getOptionEmoji(o: CommandInteractionOption): string {
  return POLL_REACTION_EMOJIS[
    `${REGIONAL_INDICATOR_PREFIX}${getOptionLetter(o)}`
  ];
}

function getEmojiChoicesMap(
  options: readonly CommandInteractionOption[]
): PollEmojiOptions {
  return options
    .filter(integerOptionFilter)
    .map((o) => ({[getOptionEmoji(o)]: o.value as number}))
    .reduce(
      (acc, next) => ({
        ...acc,
        ...next,
        [POLL_REACTION_EMOJIS[NO_ENTRY_SIGN_EMOJI]]: NONE_OPTION,
      }),
      {} as PollEmojiOptions
    );
}

function pollQuestionIntegerOption(
  name: `option_${PollOptionLetters}`,
  required: boolean = false
): (option: SlashCommandIntegerOption) => SlashCommandIntegerOption {
  return (option: SlashCommandIntegerOption) =>
    option
      .setName(name)
      .setDescription('Set a numeric option, e.g. 50')
      .setRequired(required);
}

function buildPollReplyChoices(
  options: readonly CommandInteractionOption[]
): string {
  const setChoices = options
    .filter(integerOptionFilter)
    .reduce(
      (acc, next) => (acc += `${getOptionEmoji(next)}: ${next.value} ETH\n`),
      ''
    );

  // Include additional choice for 'None' only if poll options don't already
  // include `0` value to avoid redundant choices.
  return integerOptionsInclude0value(options)
    ? setChoices
    : `${setChoices}${POLL_REACTION_EMOJIS[NO_ENTRY_SIGN_EMOJI]}: ${NONE_OPTION}\n`;
}

async function reactPollVotingEmojis(
  options: readonly CommandInteractionOption[],
  message: Message
): Promise<void> {
  const integerOptions = options.filter(integerOptionFilter);

  const reactionPromises = integerOptions.map(
    (o) => async () => await message.react(getOptionEmoji(o))
  );

  // Run sequentially so reactions are in order
  for (const fn of reactionPromises) {
    await fn();
  }

  // Include additional reaction for 'None' only if poll options don't already
  // include `0` value to avoid redundant reactions.
  if (!integerOptionsInclude0value(options)) {
    await message.react(POLL_REACTION_EMOJIS[NO_ENTRY_SIGN_EMOJI]);
  }
}

/**
 * Take only options which are integers (eth amounts) and start with `option_`.
 *
 * @param o `CommandInteractionOption`
 * @returns `CommandInteractionOption`
 */
function integerOptionFilter(o: CommandInteractionOption) {
  return o.type === 'INTEGER' && normalizeString(o.name).startsWith(`option_`);
}

/**
 * Determines if the options list should include a `0` value.
 * It will not be included if it already exists in the user-defined options.
 *
 * @param options `readonly CommandInteractionOption[]`
 * @returns `boolean`
 */
function integerOptionsInclude0value(
  options: readonly CommandInteractionOption[]
): boolean {
  return options.filter(integerOptionFilter).some((io) => io.value === 0);
}

/**
 * Parse time period from plain text to `Date` for DB storage and poll end
 * display
 *
 * Day.js (small, minimalist library https://day.js.org/en/) provides easy
 * manipulation
 */
function parseTimeForPollEndDate(pollDurationText: string): Date | undefined {
  /**
   * Assumes text input is in expected form: '[AMOUNT] [UNIT]'
   * and unit matches dayjs `OpUnitType`.
   *
   * (e.g., 20 minutes; 12 hours; 1 day; 1 week)
   *
   * We don't lowerCase the string as `m` and `M` shorthand are different.
   */
  const [amount, unit] = pollDurationText.split(' ');
  const amountNumber: number = Number(amount);
  const durationUnit: DurationUnitType = unit as DurationUnitType;

  /**
   * Validate the date duration
   *
   * Using `.isValid()`, `isDuration()` does not work as we need them to.
   */
  if (isNaN(dayjs.duration(amountNumber, durationUnit).asMilliseconds())) {
    return;
  }

  // Calculate poll end date using dayjs library and convert to native `Date`
  return dayjs().add(amountNumber, unit).toDate();
}

/**
 * Sweep command reply logic
 *
 * @param interaction `CommandInteraction`
 * @returns `Promise<void>`
 */
async function execute(interaction: CommandInteraction) {
  const {data} = interaction.options;
  const contract = interaction.options.getString(ARG_NAMES.nftContract);
  const pollDuration = interaction.options.getString(ARG_NAMES.howLong);
  const question = interaction.options.getString(ARG_NAMES.question);

  if (
    !interaction.isCommand() ||
    !contract ||
    !data?.length ||
    !pollDuration ||
    !question
  ) {
    return;
  }

  // Validate contract address
  if (!web3.utils.isAddress(normalizeString(contract))) {
    // Reply with an error/help message that only the user can see.
    await interaction.reply({
      content: INVALID_ETH_ADDRESS_ERROR_MESSAGE,
      ephemeral: true,
    });

    return;
  }

  const dateEnd = parseTimeForPollEndDate(pollDuration);

  // Validate date
  if (!dateEnd) {
    // Reply with an error/help message that only the user can see.
    await interaction.reply({
      content: DURATION_PARSE_ERROR_MESSAGE,
      ephemeral: true,
    });

    return;
  }

  const pollOptionsEmbed = new MessageEmbed()
    .setDescription(
      `${buildPollReplyChoices(data)}\u200B`
    ) /* `\u200B` = zero-width space */
    .addFields({
      name: '⏱ Poll ends:',
      /**
       * Display time in user's timezone
       *
       * `F` = Tuesday, 20 April 2021 16:20
       *
       * @see https://discord.com/developers/docs/reference#message-formatting-timestamp-styles
       */
      value: time(dateEnd, 'F'),
    });

  // Reply with user's title and options chosen
  const message = (await interaction.reply({
    content: `📊 ${bold(question)}\n`,
    embeds: [pollOptionsEmbed],
    fetchReply: true,
  })) as Message;

  const {guildId: guildID, channelId: channelID, id: messageID} = message;

  if (!guildID) {
    throw new Error(
      `No \`guildId\` was found on \`Message\` ${messageID}. Channel: ${channelID}. Poll question: ${question}.`
    );
  }

  // Store poll data in DB
  await prisma.floorSweeperPoll.create({
    data: {
      channelID,
      contractAddress: contract,
      dateEnd,
      guildID,
      messageID,
      options: getEmojiChoicesMap(data),
      question,
    },
  });

  try {
    // React with voting buttons as emojis, which correspond to option letters.
    await reactPollVotingEmojis(data, message);
  } catch (error) {
    // Delete the original reply as we cannot run a poll without voting buttons
    await message.delete();

    // Handle error at a higher level
    throw error;
  }
}

// Sweep command structure
const command = new SlashCommandBuilder()
  // Position required arguments first for better UX
  .addStringOption((option) =>
    option
      .setName(ARG_NAMES.question)
      .setDescription(
        'Set the question for this poll, e.g. How much should we spend on Doodles?'
      )
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName(ARG_NAMES.nftContract)
      .setDescription(
        "Set the NFT collection's contract address, e.g. 0x000000000000000000000000000000000000bEEF"
      )
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName(ARG_NAMES.howLong)
      .setDescription(
        'Set how long the poll should be, e.g. 20 minutes; 12 hours; 1 day; 1 week'
      )
      .setRequired(true)
  )
  /**
   * At least 1 option is required to start a poll
   * i.e. Some cases may only require a single option as a basic "yes/no" poll.
   */
  .addIntegerOption(pollQuestionIntegerOption('option_a', true))
  .addIntegerOption(pollQuestionIntegerOption('option_b'))
  .addIntegerOption(pollQuestionIntegerOption('option_c'))
  .addIntegerOption(pollQuestionIntegerOption('option_d'))
  .addIntegerOption(pollQuestionIntegerOption('option_e'))
  .addIntegerOption(pollQuestionIntegerOption('option_f'))
  .addIntegerOption(pollQuestionIntegerOption('option_g'))
  .addIntegerOption(pollQuestionIntegerOption('option_h'))
  .addIntegerOption(pollQuestionIntegerOption('option_i'))
  .addIntegerOption(pollQuestionIntegerOption('option_j'))
  // Returning last for type check
  .setName(COMMAND_NAME)
  .setDescription(COMMAND_DESCRIPTION);

// Export
export const sweep: Command = {
  data: command,
  execute,
};
