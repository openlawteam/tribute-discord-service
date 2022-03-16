import {envCheck} from './envCheck';

describe('envCheck unit tests', () => {
  test('should return `true` if all environment variables are set', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation((m) => m);

    // Uses `.env.test`
    expect(envCheck()).toBe(true);
    expect(spy).toHaveBeenCalledTimes(1);

    expect(spy.mock.calls[0][0]).toMatch(
      /✔ All required environment variables are set\./i
    );

    // Cleanup

    spy.mockRestore();
  });

  test('should return `false` if some environment variables are not set', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation((w) => w);

    const original = process.env.POSTGRES_USER;

    process.env.POSTGRES_USER = undefined;

    // Using default args; no logging
    expect(envCheck()).toBe(false);
    expect(spy).toHaveBeenCalledTimes(1);

    expect(spy.mock.calls[0][0]).toMatch(
      /⚠️  Missing required environment variable for POSTGRES_USER\./i
    );

    // Cleanup

    process.env.POSTGRES_USER = original;
    spy.mockRestore();
  });
});
