import {DaoData} from './types';

/**
 * A DEVELOPMENT configuration mapping for DAO's this app recognises.
 *
 * If you want a DAO to interact with a Discord server,
 * start by adding its information to the enum and
 * exported mapping below.
 */

type DaoNames = 'tribute';

export const DAOS_DEVELOPMENT: Record<DaoNames, DaoData> = {
  tribute: {
    friendlyName: 'Tribute DAO [DEV]',
    fullURL: 'https://demo.tributedao.com',
    registryContractAddress: '0xf5af0d9c3e4091a48925902eaAB2982e44E7a4C5',
  },
};
