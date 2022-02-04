import {REST} from '@discordjs/rest';
import {Routes} from 'discord-api-types/v9';

import {
  ApplicationNames,
  APP_ENV,
  DEVELOPMENT_GUILD_ID,
  ENVIRONMENT_VARIABLE_KEYS_BOT_TOKENS,
} from '../../config';
import {GetCommandsReturn} from '../types';
import {getEnv} from '../../helpers';

/**
 * Used to register and update
 * the slash commands for the tribute tools bot application.
 */
export async function deployCommands({
  applicationID,
  commands,
  name,
  tokenEnvVarName,
}: {
  applicationID: string;
  commands: GetCommandsReturn;
  name: ApplicationNames;
  tokenEnvVarName: typeof ENVIRONMENT_VARIABLE_KEYS_BOT_TOKENS[number];
}): Promise<void> {
  const {commandsData} = commands;

  const token = getEnv(tokenEnvVarName);

  if (!token) return;

  /**
   * When writing Discord applications using
   * slash commands the guild commands are not cached, whereas
   * global (common for production) are, and take ~1 hour to propagate.
   *
   * @see https://discordjs.guide/interactions/registering-slash-commands.html#global-commands
   */
  const route =
    APP_ENV === 'production'
      ? Routes.applicationCommands(applicationID)
      : Routes.applicationGuildCommands(applicationID, DEVELOPMENT_GUILD_ID);

  const rest = new REST({version: '9'}).setToken(token);

  console.log(`♻️  Started refreshing ${name} application (/) commands.`);

  // Deploy
  await rest.put(route, {
    body: commandsData,
  });

  console.log(`✔ Successfully reloaded ${name} application (/) commands.`);
}
