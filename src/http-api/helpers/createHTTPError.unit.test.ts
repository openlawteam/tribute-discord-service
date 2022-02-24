import {createHTTPError} from '.';

describe('createHTTPError unit tests', () => {
  test('should create HTTP error', () => {
    const CTX = {} as Parameters<typeof createHTTPError>['0']['ctx'];
    const MESSAGE: string = 'Some bad request';
    const STATUS: number = 400;

    createHTTPError({
      ctx: CTX,
      message: MESSAGE,
      status: STATUS,
    });

    expect(CTX).toEqual({
      status: STATUS,
      body: {error: {message: MESSAGE, status: STATUS}},
    });
  });
});
