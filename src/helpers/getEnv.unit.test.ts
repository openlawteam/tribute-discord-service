import {getEnv} from './getEnv';

describe('getEnv unit tests', () => {
  test('should return an environment variable', () => {
    // Assert values from `.env.test`
    expect(getEnv('APP_ENV')).toBe('localhost');
    expect(getEnv('NODE_ENV')).toBe('test');
  });

  test('should return current environment variable when changed', () => {
    const originalAppEnv = getEnv('APP_ENV');

    expect(getEnv('APP_ENV')).toBe('localhost');

    // Set to another var (e.g. someone changes the value in the production container)
    process.env.APP_ENV = 'localhost-parallel-universe';

    // Assert dynamic access
    expect(getEnv('APP_ENV')).toBe('localhost-parallel-universe');

    // Cleanup
    process.env.APP_ENV = originalAppEnv;
  });

  test('should return `undefined` when no environment variable found', () => {
    expect(getEnv('BAD_VAR' as any)).toBe(undefined);
    expect(getEnv('' as any)).toBe(undefined);
    expect(getEnv(' ' as any)).toBe(undefined);
  });
});
