import {EMPTY_BYTES32_FIXTURE} from '../../../../test';
import {getProposalErrorHandler} from './getProposalErrorHandler';

type MockHelperReturn = {
  cleanup: () => void;
  consoleErrorSpy: jest.SpyInstance<
    void,
    [message?: any, ...optionalParams: any[]]
  >;
};

function mockHelper(): MockHelperReturn {
  const consoleErrorSpy = jest
    .spyOn(console, 'error')
    .mockImplementation(() => {});

  return {
    cleanup: () => {
      consoleErrorSpy.mockRestore();
    },
    consoleErrorSpy,
  };
}

describe('getProposalErrorHandler unit tests', () => {
  test('should call `console.error` with correct args', () => {
    const {cleanup, consoleErrorSpy} = mockHelper();
    const error = new Error('Some bad error');

    expect(
      getProposalErrorHandler({
        error,
        proposalID: EMPTY_BYTES32_FIXTURE,
      })
    ).toBe(undefined);

    expect(consoleErrorSpy.mock.calls[0][0]).toMatch(
      /^error while getting snapshot hub proposal 0xfe837a5e727dacac34d8070a94918f13335f255f9bbf958d876718aac64b299d/i
    );

    expect(consoleErrorSpy.mock.calls[0][0]).toContain(
      'Error: ' + error.message
    );

    expect(consoleErrorSpy.mock.calls.length).toBe(1);

    cleanup();
  });
});
