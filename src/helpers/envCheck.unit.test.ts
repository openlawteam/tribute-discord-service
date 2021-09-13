import {envCheck} from './envCheck';

describe('envCheck unit tests', () => {
  const testOptions = {noLog: true};

  test('should return `true` if all environment variables are set', () => {
    process.env.ALCHEMY_API_KEY = 'abc123test';
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    process.env.POSTGRES_DB = 'test';
    process.env.POSTGRES_PASSWORD = 'test';
    process.env.POSTGRES_USER = 'test';

    // Using default args; no logging
    expect(envCheck(undefined, testOptions)).toBe(true);

    process.env.SOME_VAR = 'test';

    // Using supplied args; no logging
    expect(envCheck(['ALCHEMY_API_KEY'], testOptions)).toBe(true);

    // Reset env
    delete process.env.ALCHEMY_API_KEY;
    delete process.env.DATABASE_URL;
    delete process.env.POSTGRES_DB;
    delete process.env.POSTGRES_PASSWORD;
    delete process.env.POSTGRES_USER;
    delete process.env.SOME_VAR;
  });

  test('should return `false` if some, or all, environment are not set', () => {
    // Using default args; no logging
    expect(envCheck(undefined, testOptions)).toBe(false);

    // Using supplied args; no logging
    expect(envCheck(['ALCHEMY_API_KEY'], testOptions)).toBe(false);
  });
});
