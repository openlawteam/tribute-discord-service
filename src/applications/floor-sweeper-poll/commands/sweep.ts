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

import {Command} from '../../types';
import {normalizeString} from '../../../helpers';

// Add dayjs duration extension
dayjs.extend(duration);

type OptionLetters = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j';

const COMMAND_NAME: string = 'sweep';

const COMMAND_DESCRIPTION: string =
  "Creates a poll for sweeping an NFT collection's floor.";

const ARG_NAMES: Record<string, string> = {
  howLong: 'how_long',
  nftContract: 'nft_contract',
  question: 'question',
};

// For getting the `regional_indicator_<x>` emojis
const REGIONAL_INDICATOR_PREFIX: 'regional_indicator_' = 'regional_indicator_';

const NO_ENTRY_SIGN_EMOJI: 'no_entry_sign' = 'no_entry_sign';

const REACTION_EMOJIS: Record<
  | `${typeof REGIONAL_INDICATOR_PREFIX}${OptionLetters}`
  | typeof NO_ENTRY_SIGN_EMOJI,
  string
> = {
  regional_indicator_a: '🇦',
  regional_indicator_b: '🇧',
  regional_indicator_c: '🇨',
  regional_indicator_d: '🇩',
  regional_indicator_e: '🇪',
  regional_indicator_f: '🇫',
  regional_indicator_g: '🇬',
  regional_indicator_h: '🇭',
  regional_indicator_i: '🇮',
  regional_indicator_j: '🇯',
  no_entry_sign: '🚫',
};

const OPTION_REGEX: RegExp = /^option_/;

const DURATION_PARSE_ERROR_MESSAGE: string =
  'Invalid duration. Try something like: 20 minutes; 12 hours; 1 day; 1 week. Short: d,w,M,y,h,m,s,ms';

function pollQuestionIntegerOption(
  name: `option_${OptionLetters}`,
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
  const setChoices = options.filter(optionFilter).reduce((acc, next) => {
    const letter = normalizeString(
      next.name.split(OPTION_REGEX)[1]
    ) as OptionLetters;

    acc += `${REACTION_EMOJIS[`${REGIONAL_INDICATOR_PREFIX}${letter}`]}: ${
      next.value
    }\n`;

    return acc;
  }, '');

  // Include additional choice for 'None' only if poll options don't already
  // include `0` value to avoid redundant choices.
  return integerOptionsInclude0value(options)
    ? setChoices
    : `${setChoices}${REACTION_EMOJIS[NO_ENTRY_SIGN_EMOJI]}: None\n`;
}

async function reactPollVotingEmojis(
  options: readonly CommandInteractionOption[],
  message: Message
): Promise<void> {
  const integerOptions = options.filter(optionFilter);

  const reactionPromises = integerOptions.map((o) => {
    const letter = normalizeString(
      o.name.split(OPTION_REGEX)[1]
    ) as OptionLetters;

    return async () =>
      await message.react(
        REACTION_EMOJIS[`${REGIONAL_INDICATOR_PREFIX}${letter}`]
      );
  });

  // Run sequentially so reactions are in order
  for (const fn of reactionPromises) {
    await fn();
  }

  // Include additional reaction for 'None' only if poll options don't already
  // include `0` value to avoid redundant reactions.
  if (!integerOptionsInclude0value(options)) {
    await message.react(REACTION_EMOJIS[NO_ENTRY_SIGN_EMOJI]);
  }
}

/**
 * Take only options which are integers (eth amounts) and start with `option_`.
 *
 * @param o `CommandInteractionOption`
 * @returns `CommandInteractionOption`
 */
function optionFilter(o: CommandInteractionOption) {
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
  return options.filter(optionFilter).some((io) => io.value === 0);
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

export const floorSweeperPollCommand: Command = {
  // Command Structure
  data: new SlashCommandBuilder()
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
      // @todo Check if we can add validation to check for valid ETH address
      option
        .setName(ARG_NAMES.nftContract)
        .setDescription("Set the NFT collection's contract address, e.g. 0x...")
        .setRequired(true)
    )
    // Time will require time period parsing from plain text to `Date` for DB
    // storage
    .addStringOption((option) =>
      // @todo Check if we can add validation to check for valid expected input
      // needed for time parsing '[AMOUNT] [UNIT]'
      //'d' | 'M' | 'y' | 'h' | 'm' | 's' | 'ms'
      option
        .setName(ARG_NAMES.howLong)
        .setDescription(DURATION_PARSE_ERROR_MESSAGE)
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
    .setDescription(COMMAND_DESCRIPTION),

  // Command Reply
  async execute(interaction: CommandInteraction) {
    const {data} = interaction.options;
    const question = interaction.options.getString(ARG_NAMES.question);
    const pollDuration = interaction.options.getString(ARG_NAMES.howLong);

    if (
      !interaction.isCommand() ||
      !data?.length ||
      !pollDuration ||
      !question
    ) {
      return;
    }

    const dateEnd = parseTimeForPollEndDate(pollDuration);

    if (!dateEnd) {
      // Reply with an error/help message that only the user can see.
      await interaction.reply({
        content:
          'Not a valid time period. Try something like: 20 minutes; 12 hours; 1 day; 1 week. Short: d,w,M,y,h,m,s,ms',
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

    try {
      // React with voting buttons as emojis, which correspond to option letters.
      await reactPollVotingEmojis(data, message);
    } catch (error) {
      // Delete the original reply as we cannot run a poll without voting buttons
      await message.delete();

      // Handle error at a higher level
      throw error;
    }
  },
};
