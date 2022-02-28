import {AddressInfo} from 'node:net';
import {Server} from 'http';
import bodyParser from 'koa-bodyparser';
import Koa from 'koa';

import {errorHandler} from './middleware/error';
import {HTTP_API_PORT} from '../config';
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

export function httpServer(options?: HTTPServerOptions): Server {
  try {
    const app = new Koa();

    /**
     * Handle parsing the request `body`
     *
     * @see https://www.npmjs.com/package/koa-bodyparser
     */
    app.use(bodyParser());

    // Handle middleware errors
    app.use(errorHandler);

    // Use all provided HTTP API middleware
    middlewares.forEach((m) => {
      app.use(m);
    });

    // Handle errors from middleware
    app.on('error', (error, ctx) => {
      console.error(`HTTP API Error from ${ctx?.path} ${error}`);
    });

    // Start listening
    const server = app.listen(
      options?.useAnyAvailablePort ? undefined : HTTP_API_PORT
    );

    if (!options?.noLog) {
      console.log(
        `⚡︎ HTTP server running on container port ${
          (server.address() as AddressInfo).port
        }.`
      );
    }

    return server;
  } catch (error) {
    throw new Error(
      `Something went wrong while starting the HTTP server.\n${error}`
    );
  }
}
