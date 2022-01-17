import {
  SlashCommandBuilder,
  SlashCommandIntegerOption,
} from '@discordjs/builders';
import {CommandInteraction} from 'discord.js';

import {Command} from '../../types';

const POLL_NAMES = {
  howLong: 'how_long',
  nftContract: 'nft_contract',
  question: 'question',
};

const NAME: string = 'sweep';

const DESCRIPTION: string =
  "Creates a poll for sweeping an NFT collection's floor.";

type OptionLetters = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j';

const pollQuestionOption =
  (name: `option_${OptionLetters}`, required: boolean = false) =>
  (option: SlashCommandIntegerOption) =>
    option
      .setName(name)
      .setDescription('Set a numeric option, e.g. 50')
      .setRequired(required);

export const floorSweeperPollCommand: Command = {
  // Command Structure
  data: new SlashCommandBuilder()
    // Position required arguments first for better UX
    .addStringOption((option) =>
      option
        .setName(POLL_NAMES.question)
        .setDescription(
          'Set the question for this poll, e.g. How much ETH should we spend on Doodles?'
        )
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName(POLL_NAMES.nftContract)
        .setDescription("Set the NFT collection's contract address, e.g. 0x...")
        .setRequired(true)
    )
    // Time will require time period parsing from plain text to `Date` for DB storage
    .addStringOption((option) =>
      option
        .setName(POLL_NAMES.howLong)
        .setDescription(
          'Set how long the poll should be, e.g. 20 min; 12 hr; 1 day; 1 week'
        )
        .setRequired(true)
    )
    // At least 2 options are required to start a poll
    .addIntegerOption(pollQuestionOption('option_a', true))
    .addIntegerOption(pollQuestionOption('option_b', true))
    .addIntegerOption(pollQuestionOption('option_c'))
    .addIntegerOption(pollQuestionOption('option_d'))
    .addIntegerOption(pollQuestionOption('option_e'))
    .addIntegerOption(pollQuestionOption('option_f'))
    .addIntegerOption(pollQuestionOption('option_g'))
    .addIntegerOption(pollQuestionOption('option_h'))
    .addIntegerOption(pollQuestionOption('option_i'))
    .addIntegerOption(pollQuestionOption('option_j'))
    // Returning last for types
    .setName(NAME)
    .setDescription(DESCRIPTION),

  // Command Reply
  async execute(interaction: CommandInteraction) {
    // @todo repsond with `MessagePayload` and set reactions to x # of options
    await interaction.reply('Pong!');
  },
};
