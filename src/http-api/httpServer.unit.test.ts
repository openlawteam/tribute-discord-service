import {Server} from 'http';

import {httpServer} from './httpServer';

describe('httpServer unit tests', () => {
  const server = httpServer({noLog: true, useAnyAvailablePort: true});

  afterAll(async () => {
    await server?.close();
  });

  test('should start server and return Koa app', async () => {
    expect(server).toBeInstanceOf(Server);
  });
});
