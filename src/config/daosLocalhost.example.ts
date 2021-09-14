/**
 * ----------------------------------------
 * INSTRUCTIONS
 *
 * If you want to test the app in localhost
 * copy the contents of this file
 * to `daosLocalhost.ts`.
 * ----------------------------------------
 */

// import {CORE_DAO_ADAPTERS} from './daoAdapters';
// import {DaoData} from './types';

/**
 * A LOCALHOST configuration mapping for DAO's this app recognises.
 *
 * If you want a DAO to interact with a Discord server,
 * start by adding its information to the enum and
 * exported mapping below.
 *
 * ---
 *
 * Notes on localhost:
 *
 * The DAO does not have to be localhost (i.e. Ganache).
 * The localhost DAO mapping is just so the config stays out of version control.
 */

/*
export const DAO_NAMES_LOCALHOST = ['test'] as const;

export const DAOS_LOCALHOST: Record<
  typeof DAO_NAMES_LOCALHOST[number],
  DaoData
> = {
  test: {
    actions: [{name: 'SPONSORED_PROPOSAL_WEBHOOK', webhookID: 'abc123'}],
    adapters: {
      [CORE_DAO_ADAPTERS.onboarding]: {
        friendlyName: 'onboarding',
        baseURLPath: 'membership',
      },
    },
    baseURL: 'https://demo.tributedao.com',
    events: [{name: 'SPONSORED_PROPOSAL'}],
    friendlyName: 'Tribute DAO [DEV]',
    registryContractAddress: '0x0000000000000000000000000000000000000000',
  },
};
*/
