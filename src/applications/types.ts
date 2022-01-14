import {Collection, CommandInteraction} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';

import {ApplicationNames} from '../config';

export type ApplicationReturn = {
  /**
   * Friendly name for the application.
   */
  name: ApplicationNames;
  /**
   * A callback to destroy the application instance, etc.
   */
  stop?: () => Promise<any>;
};

export type Command = {
  data: SlashCommandBuilder;
  execute: (interaction: CommandInteraction) => Promise<void>;
};

export type GetCommandsReturn = {
  commandsCollection: Collection<string, Command>;
  commandsData: SlashCommandBuilder[];
};
