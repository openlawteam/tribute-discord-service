import {DAOS_DEVELOPMENT} from '../config/daos';
import {getDAODataByAddress} from './getDaoDataByAddress';
import {getDaos} from '../services/dao/getDaos';
import {getEnv} from './getEnv';

describe('getDaoDataByAddress unit tests', () => {
  test("should return a dao's data", async () => {
    const originalAppEnv = getEnv('APP_ENV');

    process.env.APP_ENV = 'development';

    expect(
      getDAODataByAddress(
        '0xf5af0d9c3e4091a48925902eaAB2982e44E7a4C5',
        await getDaos()
      )
    ).toEqual(DAOS_DEVELOPMENT.tribute);

    // Cleanup
    process.env.APP_ENV = originalAppEnv;
  });
});
