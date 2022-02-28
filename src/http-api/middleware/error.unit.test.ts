import {AddressInfo} from 'node:net';
import fetch from 'node-fetch';
import Koa from 'koa';

import {errorHandler} from './error';
import {HTTP_API_BASE_PATH} from '../config';

describe('errorHandler middleware unit tests', () => {
  test('errorHandler should handle server errors', async () => {
    let assertErrorMessage: string = '';
    let assertErrorStatusCode: number = 0;

    const app = new Koa();

    // Start listening
    const server = app.listen();

    const {port} = server?.address() as AddressInfo;

    app.use(errorHandler);

    app.use(async function badMiddleware(ctx, next) {
      if (ctx.path !== `${HTTP_API_BASE_PATH}/bad`) {
        return await next();
      }

      throw new Error('Yikes, an error!');
    });

    // Assert error
    app.on('error', (error, ctx) => {
      assertErrorMessage = error.message;
      assertErrorStatusCode = ctx.status;
    });

    // Temporarily hide warnings from `errorHandler`
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    // Temporarily hide warnings from `msw`
    const consoleWarnSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => {});

    expect(
      await (
        await fetch(`http://localhost:${port}${HTTP_API_BASE_PATH}/bad`)
      ).json()
    ).toEqual({
      error: {
        message: 'Yikes, an error!',
        status: 500,
      },
    });

    // Assert error message matches
    expect(assertErrorMessage).toMatch(/yikes, an error!/i);
    // Assert error code matches
    expect(assertErrorStatusCode).toBe(500);

    // Cleanup

    await server?.close();

    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  test('errorHandler should call `next`', async () => {
    let assertErrorMessage: string = '';
    let assertErrorStatusCode: number = 0;
    let assertNextCalled: boolean = false;
    let assertGoodHandlerRan: boolean = false;

    const app = new Koa();

    // Start listening
    const server = app.listen();

    const {port} = server?.address() as AddressInfo;

    app.use(errorHandler);

    app.use(async function badMiddleware(ctx, next) {
      if (ctx.path !== `${HTTP_API_BASE_PATH}/bad`) {
        assertNextCalled = true;

        return await next();
      }

      throw new Error('Yikes, an error!');
    });

    app.use(async function badMiddleware(ctx, next) {
      if (ctx.path !== `${HTTP_API_BASE_PATH}/not-bad-at-all`) {
        return await next();
      }

      assertGoodHandlerRan = true;
    });

    // Assert error
    app.on('error', (error, ctx) => {
      assertErrorMessage = error.message;
      assertErrorStatusCode = ctx.status;
    });

    // Temporarily hide warnings from `errorHandler`
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    // Temporarily hide warnings from `msw`
    const consoleWarnSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => {});

    await fetch(`http://localhost:${port}${HTTP_API_BASE_PATH}/not-bad-at-all`);

    // Assert error message matches
    expect(assertErrorMessage).toBe('');
    // Assert error code matches
    expect(assertErrorStatusCode).toBe(0);
    // Assert next was called
    expect(assertNextCalled).toBe(true);
    // Assert good handler was called
    expect(assertGoodHandlerRan).toBe(true);

    // Cleanup

    await server?.close();

    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });
});
