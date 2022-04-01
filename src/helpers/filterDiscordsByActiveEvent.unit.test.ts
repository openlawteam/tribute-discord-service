import {CORE_DAO_ADAPTERS, DaoDiscordConfig} from '../config';
import {filterDiscordsByActiveEvent} from './filterDiscordsByActiveEvent';
import {GUILD_ID_FIXTURE} from '../../test/fixtures/constants';

describe('filterDiscordsByActiveEvent unit tests', () => {
  const TEST_DAOS: Record<string, DaoDiscordConfig> = {
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
      guildID: GUILD_ID_FIXTURE,
      internalName: 'test',
      registryContractAddress: '0xf5af0d9c3e4091a48925902eaAB2982e44E7a4C5',
    },

    test1: {
      actions: [],
      adapters: {
        [CORE_DAO_ADAPTERS.onboarding]: {
          friendlyName: 'onboarding',
          baseURLPath: 'membership',
        },
      },
      baseURL: 'https://demo.tributedao.com',
      events: [{name: 'SNAPSHOT_PROPOSAL_CREATED'}],
      friendlyName: 'Tribute DAO [DEV]',
      guildID: GUILD_ID_FIXTURE,
      internalName: 'test1',
      registryContractAddress: '0x0000000000000000000000000000000000000000',
    },

    test2: {
      actions: [],
      adapters: {
        [CORE_DAO_ADAPTERS.onboarding]: {
          friendlyName: 'onboarding',
          baseURLPath: 'membership',
        },
      },
      baseURL: 'https://demo.tributedao.com',
      events: [
        {name: 'SPONSORED_PROPOSAL', active: false},
        {name: 'SNAPSHOT_PROPOSAL_CREATED', active: true},
      ],
      friendlyName: 'Tribute DAO [DEV]',
      guildID: GUILD_ID_FIXTURE,
      internalName: 'test2',
      registryContractAddress: '0x0000000000000000000000000000000000000000',
    },

    test3: {
      actions: [],
      adapters: {
        [CORE_DAO_ADAPTERS.onboarding]: {
          friendlyName: 'onboarding',
          baseURLPath: 'membership',
        },
      },
      baseURL: 'https://demo.tributedao.com',
      events: [
        {name: 'SPONSORED_PROPOSAL', active: true},
        {name: 'SNAPSHOT_PROPOSAL_CREATED', active: false},
      ],
      friendlyName: 'Tribute DAO [DEV]',
      guildID: GUILD_ID_FIXTURE,
      internalName: 'test3',
      registryContractAddress: '0x0000000000000000000000000000000000000000',
    },
  };

  test('should return filtered dao configs', async () => {
    // Assert `SPONSORED_PROPOSAL`
    const filteredDaos = filterDiscordsByActiveEvent(
      TEST_DAOS,
      'SPONSORED_PROPOSAL'
    );

    expect(Object.entries(filteredDaos).length).toBe(2);
    expect(filteredDaos?.test).toEqual(TEST_DAOS.test);
    expect(filteredDaos?.test3).toEqual(TEST_DAOS.test3);

    // Assert `PROCESSED_PROPOSAL`
    const filteredDaos1 = filterDiscordsByActiveEvent(
      TEST_DAOS,
      'SNAPSHOT_PROPOSAL_CREATED'
    );

    expect(Object.entries(filteredDaos1).length).toBe(2);
    expect(filteredDaos1?.test1).toEqual(TEST_DAOS.test1);
    expect(filteredDaos1?.test2).toEqual(TEST_DAOS.test2);

    // Assert no DAOs
    const filteredDaos2 = filterDiscordsByActiveEvent(
      TEST_DAOS,
      'BAD_EVENT' as any
    );

    expect(Object.entries(filteredDaos2).length).toBe(0);
  });
});
