import {DaoDiscordConfig, DiscordConfigs} from '../../config/types';
import {getEnv} from '../../helpers';

export const DAO_DISCORDS_LOCALHOST_PATH: string =
  '../../config/discords/daos/daosLocalhost';

export async function getDaos(): Promise<
  DiscordConfigs<DaoDiscordConfig> | undefined
> {
  const appEnv = getEnv('APP_ENV');

  try {
    switch (appEnv) {
      case 'production':
        return (await import('../../config/discords/daos/daosProduction'))
          .DAOS_PRODUCTION;

      case 'development':
        return (await import('../../config/discords/daos/daosDevelopment'))
          .DAOS_DEVELOPMENT;

      case 'localhost':
        try {
          // Evade TypeScript errors for a file which may not exist by moving to a variable
          return (await import(DAO_DISCORDS_LOCALHOST_PATH)).DAOS_LOCALHOST;
        } catch (error) {
          throw new Error(
            `No DAO configuration was found at \`..config/discords/daos/daosLocalhost\`. Did you already copy and rename \`daosLocalhost.example.ts\`?`
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
