import {actionErrorHandler} from './actionErrorHandler';

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

describe('actionErrorHandler unit tests', () => {
  test('should call `console.error` with correct args', () => {
    const {cleanup, consoleErrorSpy} = mockHelper();
    const error = new Error('Some bad error');

    expect(
      actionErrorHandler({
        actionName: 'SPONSORED_PROPOSAL_WEBHOOK',
        error,
        event: {name: 'SPONSORED_PROPOSAL'},
      })
    ).toBe(undefined);

    expect(consoleErrorSpy.mock.calls[0][0]).toMatch(
      /^error while executing SPONSORED_PROPOSAL_WEBHOOK action for sponsored_proposal event/i
    );

    expect(consoleErrorSpy.mock.calls[0][0]).toContain(
      'Error: ' + error.message
    );

    expect(consoleErrorSpy.mock.calls.length).toBe(1);

    cleanup();
  });
});
