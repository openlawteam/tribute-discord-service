import {AddressInfo} from 'node:net';
import {Server} from 'http';
import bodyParser from 'koa-bodyparser';
import Koa from 'koa';

import {errorHandler} from './middleware/error';
import {getEnv} from '../helpers';
import {middlewares} from '.';

type HTTPServerOptions =
  | {
      /**
       * Do not log to stdout. Helpful for testing.
       */
      noLog?: boolean;
      /**
       * Let the server choose any open port. Helpful for testing.
       */
      useAnyAvailablePort?: boolean;
    }
  | undefined;

export function httpServer(options?: HTTPServerOptions): Server | undefined {
  try {
    const app = new Koa();

    const port: number | undefined =
      Number(getEnv('HTTP_API_PORT')) || undefined;

    /**
     * Handle parsing the request `body`
     *
     * @see https://www.npmjs.com/package/koa-bodyparser
     */
    app.use(bodyParser());

    // Handle middlware errors
    app.use(errorHandler());

    // Use all provided HTTP API middleware
    middlewares.forEach((m) => {
      app.use(m());
    });

    // Handle errors from middleware
    app.on('error', (error, ctx) => {
      console.error('HTTP API Error from', ctx?.path, error);
    });

    // Start listening
    const server = app.listen(options?.useAnyAvailablePort ? undefined : port);

    if (!options?.noLog) {
      console.log(
        `⚡︎ HTTP server running on port ${
          (server.address() as AddressInfo).port
        }.`
      );
    }

    return server;
  } catch (error) {
    console.error(
      `Something went wrong while starting the HTTP server.\n${error}`
    );
  }
}
