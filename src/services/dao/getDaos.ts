import {Daos} from '../../config/types';
import {getEnv} from '../../helpers';

export async function getDaos(): Promise<Daos | undefined> {
  const appEnv = getEnv('APP_ENV');

  try {
    switch (appEnv) {
      case 'production':
        const {DAOS_PRODUCTION} = await import(
          '../../config/daoDiscords/daosProduction'
        );

        return DAOS_PRODUCTION;

      case 'development':
        const {DAOS_DEVELOPMENT} = await import(
          '../../config/daoDiscords/daosDevelopment'
        );

        return DAOS_DEVELOPMENT;

      case 'localhost':
        // Evade TypeScript errors for a file which may not exist by moving to a variable
        const localhostPath: string = '../../config/daos/daosLocalhost';

        try {
          const {DAOS_LOCALHOST} = await import(localhostPath);

          return DAOS_LOCALHOST;
        } catch (error) {
          throw new Error(
            `No DAO configuration was found at \`../config/daos/daosLocalhost\`. Did you already copy and rename \`daosLocalhost.example.ts\`?`
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
