import {DAOS_DEVELOPMENT} from '../../config/daosDevelopment';
import {DAOS_PRODUCTION} from '../../config/daosProduction';
import {getDaos} from './getDaos';
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
      const maybeFile: string = '../../config/daosLocalhost';

      // Assert result matches config file's `DAOS_LOCALHOST`.
      const {DAOS_LOCALHOST} = await import(maybeFile);

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
