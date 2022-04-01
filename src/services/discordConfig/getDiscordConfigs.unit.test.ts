import {
  DEVELOPMENT_DISCORD_CONFIGS,
  PRODUCTION_DISCORD_CONFIGS,
} from '../../config/discords/general';
import {
  GENERAL_DISCORDS_LOCALHOST_PATH,
  getDiscordConfigs,
} from './getDiscordConfigs';
import {getEnv} from '../../helpers';

describe('getDiscordConfig unit tests', () => {
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

  test('should return localhost "general" discord configs', async () => {
    process.env.APP_ENV = 'localhost';

    const localhost = await getDiscordConfigs();

    try {
      // Attempt assert `undefined` (no config file)
      expect(localhost).toBe(undefined);
    } catch (error) {
      // Assert result matches config file's `LOCALHOST_DISCORD_CONFIGS`.
      const {LOCALHOST_DISCORD_CONFIGS} = await import(
        GENERAL_DISCORDS_LOCALHOST_PATH
      );

      expect(localhost).toEqual(LOCALHOST_DISCORD_CONFIGS);
    }
  });

  test('should return development "general" discord configs', async () => {
    process.env.APP_ENV = 'development';

    expect(await getDiscordConfigs()).toBe(DEVELOPMENT_DISCORD_CONFIGS);
  });

  test('should return production "general" discord configs', async () => {
    process.env.APP_ENV = 'production';

    expect(await getDiscordConfigs()).toEqual(PRODUCTION_DISCORD_CONFIGS);
  });
});
