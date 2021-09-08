import {DaoData} from './types';

/**
 * A PRODUCTION configuration mapping for DAO's this app recognises.
 *
 * If you want a DAO to interact with a Discord server,
 * start by adding its information to the enum and
 * exported mapping below.
 */

type DaoNames = 'muse0';

export const DAOS_PRODUCTION: Record<DaoNames, DaoData> = {
  muse0: {
    friendlyName: 'Muse0',
    fullURL: 'https://muse0.xyz',
    registryContractAddress: '0x7c8B281C56f7ef9b8099D3F491AF24DC2C2e3ee0',
  },
};
