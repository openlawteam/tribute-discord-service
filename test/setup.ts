const path = require('path');

/**
 * Test suite setup. Runs before tests start.
 *
 * @see https://jestjs.io/docs/configuration#setupfilesafterenv-array
 */

/**
 * Require any env vars for testing environment
 * as early as possible
 *
 * Do not import anything which a tests use before the env vars are merged
 *   to avoid the tests using outdated env vars.
 */
const {parsed: testEnv} = require('dotenv').config({
  path: `${path.resolve(process.cwd(), 'test/.env.test')}`,
});

// Merge the environment variables, with `testEnv` taking priority.
process.env = {
  ...process.env,
  ...testEnv,
};
