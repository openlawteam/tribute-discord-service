import {AddressInfo} from 'node:net';
import {Server} from 'http';

import {getEnv} from '../helpers';
import {koaInstance as app, middlewares} from '.';

type HTTPServerOptions = {noLog: boolean} | undefined;

export function httpServer(options?: HTTPServerOptions): Server | undefined {
  try {
    const port: number | undefined =
      Number(getEnv('HTTP_API_PORT')) || undefined;

    // Use all provided HTTP API middleware
    middlewares.forEach((m) => {
      app.use(m());
    });

    const server = app.listen(port);

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
