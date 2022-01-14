import {CommandInteraction} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';

import {Command} from '../../types';

const NAME: string = 'floor-sweeper-poll';

const DESCRIPTION: string =
  "Creates a poll for sweeping an NFT collection's floor.";

export const floorSweeperPollCommand: Command = {
  data: new SlashCommandBuilder().setName(NAME).setDescription(DESCRIPTION),
  async execute(interaction: CommandInteraction) {
    await interaction.reply('Pong!');
  },
};
