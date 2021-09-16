import Web3 from 'web3';

import {FakeHttpProvider} from './fakeHttpProvider';
import {server} from './msw/server';

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

// Create a test suite mock Web3 provider so we can inject results and errors
export const mockWeb3Provider = new FakeHttpProvider();

/**
 * Mock the Alchemy Web3 instance
 *
 * This should be hoisted to the module's top level.
 *
 * @see https://jestjs.io/docs/jest-object#jestmockmodulename-factory-options
 */
jest.mock('../src/alchemyWeb3Instance', () => {
  return {
    __esModule: true,
    web3: new Web3(mockWeb3Provider as any) as any,
  };
});

beforeAll(() => {
  // Start msw server before all tests
  server.listen({
    onUnhandledRequest: 'warn',
  });
});

afterEach(() => {
  // Reset msw server handlers between tests
  server.resetHandlers();

  // @see https://jestjs.io/docs/mock-function-api#mockfnmockreset
  jest.resetAllMocks();

  mockWeb3Provider.reset();
});

afterAll(() => {
  // Close msw server after tests have run
  server.close();
});
