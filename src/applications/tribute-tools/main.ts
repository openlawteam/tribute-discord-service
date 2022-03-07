import {
  sweepEndedPollsHandler,
  sweepPollReactionHandler,
} from './handlers/sweep';
import {
  buyPollReactionHandler,
  buyPollRemoveReactionHandler,
  fundPollReactionHandler,
  fundPollRemoveReactionHandler,
  interactionExecuteHandler,
} from './handlers';
import {ApplicationReturn} from '../types';
import {deployCommands, destroyClientHandler, getCommands} from '../helpers';
import {getEnv} from '../../helpers';
import {getTributeToolsClient} from '.';
import {TRIBUTE_TOOLS_BOT_ID} from '../../config';

export async function tributeToolsBot(): Promise<
  ApplicationReturn | undefined
> {
  try {
    if (!getEnv('BOT_TOKEN_TRIBUTE_TOOLS')) {
      return;
    }

    const commands = await getCommands(async () => await import('./commands'));

    // Deploy commands
    try {
      await deployCommands({
        applicationID: TRIBUTE_TOOLS_BOT_ID,
        commands,
        name: 'TRIBUTE_TOOLS_BOT',
        tokenEnvVarName: 'BOT_TOKEN_TRIBUTE_TOOLS',
      });
    } catch (error) {
      console.error(
        `Discord commands for TRIBUTE_TOOLS_BOT could not be deployed. ${error}`
      );

      return;
    }

    // Get client and log in
    const {client, stop} = await getTributeToolsClient();

    // When the Discord client is ready, run this code (only once)
    client.once('ready', (): void => {
      console.log('🤖  Tribute Tools bot ready');

      // Poll every x seconds to check for ended polls and process them
      sweepEndedPollsHandler({client});
    });

    // Listen for interactions and possibly run commands
    client.on('interactionCreate', (interaction) => {
      interactionExecuteHandler({commands, interaction});
    });

    // Listen to reactions on messages, and possibly handle.
    client.on('messageReactionAdd', (reaction, user) => {
      buyPollReactionHandler({reaction, user});
      fundPollReactionHandler({reaction, user});
      sweepPollReactionHandler({reaction, user});
    });

    // Listen to the removal of reactions on messages, and possibly handle.
    client.on('messageReactionRemove', (reaction, user) => {
      fundPollRemoveReactionHandler({reaction, user});
      buyPollRemoveReactionHandler({reaction, user});
    });

    return {
      client,
      name: 'TRIBUTE_TOOLS_BOT',
      stop,
    };
  } catch (error) {
    console.error(error);
  }
}
