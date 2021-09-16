import {isDebug} from './isDebug';

describe('isDebug unit tests', () => {
  test('should return `true` when `DEBUG=true`', () => {
    const originalDEBUG = process.env.DEBUG;

    process.env.DEBUG = 'true';

    expect(isDebug()).toBe(true);

    // Cleanup

    process.env.DEBUG = originalDEBUG;
  });

  test('should return `false` when `DEBUG=false`', () => {
    const originalDEBUG = process.env.DEBUG;

    process.env.DEBUG = 'false';

    expect(isDebug()).toBe(false);

    // Cleanup

    process.env.DEBUG = originalDEBUG;
  });
});
