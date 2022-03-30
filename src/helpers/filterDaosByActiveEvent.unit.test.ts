import {CORE_DAO_ADAPTERS, DaoEntityConfig} from '../config';
import {filterDaosByActiveEvent} from './filterDaosByActiveEvent';
import {GUILD_ID_FIXTURE} from '../../test/fixtures/constants';

describe('filterDaosByActiveEvent unit tests', () => {
  const TEST_DAOS: Record<string, DaoEntityConfig> = {
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
      events: [{name: 'PROCESSED_PROPOSAL' as any}],
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
        {name: 'PROCESSED_PROPOSAL' as any, active: true},
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
        {name: 'PROCESSED_PROPOSAL' as any, active: false},
      ],
      friendlyName: 'Tribute DAO [DEV]',
      guildID: GUILD_ID_FIXTURE,
      internalName: 'test3',
      registryContractAddress: '0x0000000000000000000000000000000000000000',
    },
  };

  test('should return filtered daos', async () => {
    // Assert `SPONSORED_PROPOSAL`
    const filteredDaos = filterDaosByActiveEvent(
      TEST_DAOS,
      'SPONSORED_PROPOSAL'
    );

    expect(Object.entries(filteredDaos).length).toBe(2);
    expect(filteredDaos?.test).toEqual(TEST_DAOS.test);
    expect(filteredDaos?.test3).toEqual(TEST_DAOS.test3);

    // Assert `PROCESSED_PROPOSAL`
    const filteredDaos1 = filterDaosByActiveEvent(
      TEST_DAOS,
      'PROCESSED_PROPOSAL' as any
    );

    expect(Object.entries(filteredDaos1).length).toBe(2);
    expect(filteredDaos1?.test1).toEqual(TEST_DAOS.test1);
    expect(filteredDaos1?.test2).toEqual(TEST_DAOS.test2);

    // Assert no DAOs
    const filteredDaos2 = filterDaosByActiveEvent(TEST_DAOS, 'MEOW' as any);

    expect(Object.entries(filteredDaos2).length).toBe(0);
  });
});
