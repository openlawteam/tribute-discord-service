import {DAO_DISCORDS_LOCALHOST_PATH, getDaoDiscordConfigs} from './';
import {DAOS_DEVELOPMENT, DAOS_PRODUCTION} from '../../config/discords/daos';
import {getEnv} from '../../helpers';

describe('getDaoDiscordConfigs unit tests', () => {
  const appEnvOriginal = getEnv('APP_ENV');
  const consoleWarnOriginal = console.warn;

  beforeAll(() => {
    console.warn = () => {};
  });

  afterEach(() => {
    // Cleanup env var
    process.env.APP_ENV = appEnvOriginal;
  });

  afterAll(() => {
    // Restore log warn
    console.warn = consoleWarnOriginal;
  });

  test('should return localhost dao configs', async () => {
    process.env.APP_ENV = 'localhost';

    const localhostDaos = await getDaoDiscordConfigs();

    try {
      // Attempt assert `undefined` (no config file)
      expect(localhostDaos).toBe(undefined);
    } catch (error) {
      // Assert result matches config file's `DAOS_LOCALHOST`.
      const {DAOS_LOCALHOST} = await import(DAO_DISCORDS_LOCALHOST_PATH);

      expect(localhostDaos).toEqual(DAOS_LOCALHOST);
    }
  });

  test('should return development dao configs', async () => {
    process.env.APP_ENV = 'development';

    expect(await getDaoDiscordConfigs()).toBe(DAOS_DEVELOPMENT);
  });

  test('should return production dao configs', async () => {
    process.env.APP_ENV = 'production';

    expect(await getDaoDiscordConfigs()).toEqual(DAOS_PRODUCTION);
  });
});
