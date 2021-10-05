import {Server} from 'http';

import {httpServer} from './httpServer';

describe('httpServer unit tests', () => {
  test('should start server and return Koa app', async () => {
    const server = httpServer({noLog: true});

    expect(server).toBeInstanceOf(Server);

    // Cleanup
    await server?.close();
  });
});
