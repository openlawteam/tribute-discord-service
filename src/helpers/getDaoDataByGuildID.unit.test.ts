import {FAKE_DAOS_FIXTURE, GUILD_ID_FIXTURE} from '../../test/fixtures';
import {getDaoDataByGuildID} from './getDaoDataByGuildID';

describe('getDaoDataByGuildID unit tests', () => {
  test("should return a dao's data", async () => {
    expect(getDaoDataByGuildID(GUILD_ID_FIXTURE, FAKE_DAOS_FIXTURE)).toEqual(
      FAKE_DAOS_FIXTURE.test
    );
  });

  test('should return `undefined`', async () => {
    expect(getDaoDataByGuildID('1234567', FAKE_DAOS_FIXTURE)).toEqual(
      undefined
    );
  });
});
