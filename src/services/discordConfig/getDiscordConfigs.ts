import {DiscordConfig, DiscordConfigs} from '../../config/types';
import {getEnv} from '../../helpers';

export const GENERAL_DISCORDS_LOCALHOST_PATH: string =
  '../../config/discords/general/localhost';

export async function getDiscordConfigs(): Promise<
  DiscordConfigs<DiscordConfig> | undefined
> {
  const appEnv = getEnv('APP_ENV');

  try {
    switch (appEnv) {
      case 'production':
        return (await import('../../config/discords/general/production'))
          .PRODUCTION_DISCORD_CONFIGS;

      case 'development':
        return (await import('../../config/discords/general/development'))
          .DEVELOPMENT_DISCORD_CONFIGS;

      case 'localhost':
        try {
          // Evade TypeScript errors for a file which may not exist by moving to a variable
          return (await import(GENERAL_DISCORDS_LOCALHOST_PATH))
            .LOCALHOST_DISCORD_CONFIGS;
        } catch (error) {
          throw new Error(
            `No DAO configuration was found at \`..config/discords/general/localhost\`. Did you already copy and rename \`localhost.example.ts\`?`
          );
        }

      default:
        throw new Error(`No \`APP_ENV\` was found by the name "${appEnv}".`);
    }
  } catch (error) {
    console.warn((error as Error).message);

    return undefined;
  }
}
