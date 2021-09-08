import {Dao} from '@prisma/client';

import {getDaoByRegistryAddress} from './getDaoByRegistryAddress';
import {prismaMock} from '../../../test/prismaMock';

describe('getDaoByRegistryAddress unit tests', () => {
  test('should get a dao by its name', async () => {
    const daoResult: Dao = {
      createdAt: new Date(0),
      fullURL: 'https://cooldao.it',
      id: 1,
      name: 'Cool DAO',
      registryAddress: '0x0000000000000000000000000000000000000000',
    };

    // Mock result
    prismaMock.dao.findUnique.mockResolvedValue(daoResult);

    expect(
      await getDaoByRegistryAddress(
        '0x0000000000000000000000000000000000000000'
      )
    ).toEqual(daoResult);
  });

  test('should throw an error if argument is bad', async () => {
    // Mock error
    prismaMock.dao.findUnique.mockRejectedValue(new Error('Ugh!'));

    try {
      await getDaoByRegistryAddress(
        '0x0000000000000000000000000000000000000000'
      );
    } catch (error: any) {
      expect(error?.message).toMatch(/^ugh!$/i);
    }
  });
});
