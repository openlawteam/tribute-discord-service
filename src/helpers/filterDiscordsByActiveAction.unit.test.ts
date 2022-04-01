import {CORE_DAO_ADAPTERS, DaoDiscordConfig} from '../config';
import {filterDiscordsByActiveAction} from './filterDiscordsByActiveAction';
import {GUILD_ID_FIXTURE} from '../../test/fixtures/constants';

describe('filterDiscordsByActiveAction unit tests', () => {
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
      actions: [
        {name: 'SNAPSHOT_PROPOSAL_CREATED_WEBHOOK', webhookID: 'abc123'},
      ],
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
      internalName: 'test1',
      registryContractAddress: '0x0000000000000000000000000000000000000000',
    },

    test2: {
      actions: [
        {
          name: 'SPONSORED_PROPOSAL_WEBHOOK',
          active: false,
          webhookID: 'abc123',
        },
        {
          name: 'SNAPSHOT_PROPOSAL_CREATED_WEBHOOK',
          active: true,
          webhookID: 'def456',
        },
      ],
      adapters: {
        [CORE_DAO_ADAPTERS.onboarding]: {
          friendlyName: 'onboarding',
          baseURLPath: 'membership',
        },
      },
      baseURL: 'https://demo.tributedao.com',
      events: [
        {name: 'SPONSORED_PROPOSAL', active: false},
        {name: 'SPONSORED_PROPOSAL' as any, active: true},
      ],
      friendlyName: 'Tribute DAO [DEV]',
      guildID: GUILD_ID_FIXTURE,
      internalName: 'test2',
      registryContractAddress: '0x0000000000000000000000000000000000000000',
    },

    test3: {
      actions: [
        {name: 'SPONSORED_PROPOSAL_WEBHOOK', active: true, webhookID: 'abc123'},
        {
          name: 'SNAPSHOT_PROPOSAL_CREATED_WEBHOOK',
          active: false,
          webhookID: 'def456',
        },
      ],
      adapters: {
        [CORE_DAO_ADAPTERS.onboarding]: {
          friendlyName: 'onboarding',
          baseURLPath: 'membership',
        },
      },
      baseURL: 'https://demo.tributedao.com',
      events: [
        {name: 'SPONSORED_PROPOSAL', active: true},
        {name: 'SPONSORED_PROPOSAL' as any, active: false},
      ],
      friendlyName: 'Tribute DAO [DEV]',
      guildID: GUILD_ID_FIXTURE,
      internalName: 'test3',
      registryContractAddress: '0x0000000000000000000000000000000000000000',
    },
  };

  test('should return filtered dao configs', async () => {
    // Assert `SPONSORED_PROPOSAL`
    const filteredDaos = filterDiscordsByActiveAction(
      TEST_DAOS,
      'SPONSORED_PROPOSAL_WEBHOOK'
    );

    expect(Object.entries(filteredDaos).length).toBe(2);
    expect(filteredDaos?.test).toEqual(TEST_DAOS.test);
    expect(filteredDaos?.test3).toEqual(TEST_DAOS.test3);

    // Assert `BAD_ACTION`
    const filteredDaos1 = filterDiscordsByActiveAction(
      TEST_DAOS,
      'SNAPSHOT_PROPOSAL_CREATED_WEBHOOK'
    );

    expect(Object.entries(filteredDaos1).length).toBe(2);
    expect(filteredDaos1?.test1).toEqual(TEST_DAOS.test1);
    expect(filteredDaos1?.test2).toEqual(TEST_DAOS.test2);

    // Assert no DAOs
    const filteredDaos2 = filterDiscordsByActiveAction(
      TEST_DAOS,
      'BAD_ACTION' as any
    );

    expect(Object.entries(filteredDaos2).length).toBe(0);
  });
});
