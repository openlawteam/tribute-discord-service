import {FAKE_DAOS_FIXTURE, GUILD_ID_FIXTURE} from '../../test/fixtures';
import {getDiscordDataByGuildID} from './getDiscordDataByGuildID';

describe('getDiscordDataByGuildID unit tests', () => {
  test("should return a dao's data", async () => {
    expect(
      getDiscordDataByGuildID(GUILD_ID_FIXTURE, FAKE_DAOS_FIXTURE)
    ).toEqual(FAKE_DAOS_FIXTURE.test);
  });

  test('should return `undefined`', async () => {
    expect(getDiscordDataByGuildID('1234567', FAKE_DAOS_FIXTURE)).toEqual(
      undefined
    );
  });
});
