import {ETH_ADDRESS_FIXTURE, FAKE_DAOS_FIXTURE} from '../../test/fixtures';
import {getDaoDataByAddress} from './getDaoDataByAddress';

describe('getDaoDataByAddress unit tests', () => {
  test("should return a dao's data", async () => {
    expect(getDaoDataByAddress(ETH_ADDRESS_FIXTURE, FAKE_DAOS_FIXTURE)).toEqual(
      FAKE_DAOS_FIXTURE.test
    );
  });

  test('should return `undefined`', async () => {
    expect(
      getDaoDataByAddress(
        '0xf5af0d9c3e4091a48925902eaAB2982e44E7a4C5',
        FAKE_DAOS_FIXTURE
      )
    ).toEqual(undefined);
  });
});
