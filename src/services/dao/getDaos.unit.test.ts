import {DAOS_DEVELOPMENT, DAOS_PRODUCTION} from '../../config/discords/daos';
import {DAO_DISCORDS_LOCALHOST_PATH, getDaos} from './getDaos';
import {getEnv} from '../../helpers';

describe('getDaos unit tests', () => {
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

  test('should return localhost daos', async () => {
    process.env.APP_ENV = 'localhost';

    const localhostDaos = await getDaos();

    try {
      // Attempt assert `undefined` (no config file)
      expect(localhostDaos).toBe(undefined);
    } catch (error) {
      // Assert result matches config file's `DAOS_LOCALHOST`.
      const {DAOS_LOCALHOST} = await import(DAO_DISCORDS_LOCALHOST_PATH);

      expect(localhostDaos).toEqual(DAOS_LOCALHOST);
    }
  });

  test('should return development daos', async () => {
    process.env.APP_ENV = 'development';

    expect(await getDaos()).toBe(DAOS_DEVELOPMENT);
  });

  test('should return production daos', async () => {
    process.env.APP_ENV = 'production';

    expect(await getDaos()).toEqual(DAOS_PRODUCTION);
  });
});
