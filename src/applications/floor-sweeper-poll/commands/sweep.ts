import {
  bold,
  SlashCommandBuilder,
  SlashCommandIntegerOption,
} from '@discordjs/builders';
import {
  CommandInteraction,
  CommandInteractionOption,
  Message,
  MessageEmbed,
} from 'discord.js';

import {Command} from '../../types';
import {normalizeString} from '../../../helpers';

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
  let optionsValuesInclude0: boolean = false;

  const setChoices = options.filter(optionFilter).reduce((acc, next) => {
    const letter = normalizeString(
      next.name.split(OPTION_REGEX)[1]
    ) as OptionLetters;

    if (next.value === 0) {
      optionsValuesInclude0 = true;
    }

    acc += `${REACTION_EMOJIS[`${REGIONAL_INDICATOR_PREFIX}${letter}`]}: ${
      next.value
    }\n`;

    return acc;
  }, '');

  // Include additional choice for 'None' only if options don't already include
  // `0` value to avoid redundant choices.
  return optionsValuesInclude0
    ? setChoices
    : `${setChoices}${REACTION_EMOJIS[NO_ENTRY_SIGN_EMOJI]}: None\n`;
}

async function reactPollVotingEmojis(
  options: readonly CommandInteractionOption[],
  message: Message
): Promise<void> {
  let optionsValuesInclude0: boolean = false;

  const integerOptions = options.filter(optionFilter);

  const reactionPromises = integerOptions.map((o) => {
    const letter = normalizeString(
      o.name.split(OPTION_REGEX)[1]
    ) as OptionLetters;

    if (o.value === 0) {
      optionsValuesInclude0 = true;
    }

    return async () =>
      await message.react(
        REACTION_EMOJIS[`${REGIONAL_INDICATOR_PREFIX}${letter}`]
      );
  });

  // Run sequentially so reactions are in order
  for (const fn of reactionPromises) {
    await fn();
  }

  // Include additional reaction for 'None' only if options don't already
  // include `0` value to avoid redundant reactions.
  if (!optionsValuesInclude0) {
    await message.react(REACTION_EMOJIS[NO_ENTRY_SIGN_EMOJI]);
  }
}

function optionFilter(o: CommandInteractionOption) {
  return o.type === 'INTEGER' && normalizeString(o.name).startsWith(`option_`);
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
      option
        .setName(ARG_NAMES.nftContract)
        .setDescription("Set the NFT collection's contract address, e.g. 0x...")
        .setRequired(true)
    )
    // Time will require time period parsing from plain text to `Date` for DB storage
    .addStringOption((option) =>
      option
        .setName(ARG_NAMES.howLong)
        .setDescription(
          'Set how long the poll should be, e.g. 20 min; 12 hr; 1 day; 1 week'
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
    .setDescription(COMMAND_DESCRIPTION),

  // Command Reply
  async execute(interaction: CommandInteraction) {
    const question = interaction.options.getString(ARG_NAMES.question);
    const {data} = interaction.options;

    if (!interaction.isCommand() || !question || !data?.length) {
      return;
    }

    const pollOptionsEmbed = new MessageEmbed()
      .setDescription(
        `${buildPollReplyChoices(data)}\u200B`
      ) /* `\u200B` = zero-width space */
      .addFields({name: '⏱ Poll ends:', value: '<todo: parse time>'});

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
      console.error(error);
    }
  },
};
