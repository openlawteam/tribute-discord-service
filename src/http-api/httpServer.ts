import {AddressInfo} from 'node:net';
import {Server} from 'http';

import {errorHandler} from './middleware/error';
import {getEnv} from '../helpers';
import {koaInstance as app, middlewares} from '.';

type HTTPServerOptions =
  | {noLog?: boolean; useAnyAvailablePort?: boolean}
  | undefined;

export function httpServer(options?: HTTPServerOptions): Server | undefined {
  try {
    const port: number | undefined =
      Number(getEnv('HTTP_API_PORT')) || undefined;

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
