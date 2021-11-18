import {AddressInfo} from 'node:net';
import fetch from 'node-fetch';

import {HTTP_API_BASE_PATH} from '../config';
import {HTTPMethod} from '../types';
import {httpServer} from '../httpServer';

describe('snapshotWebhook unit tests', () => {
  const server = httpServer({noLog: true, useAnyAvailablePort: true});

  afterAll(async () => {
    await server?.close();
  });

  test('should return response when `POST /snapshot-webhook`', async () => {
    const {port} = server?.address() as AddressInfo;

    // Temporarily hide warnings from `msw`
    const consoleWarnSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => {});

    expect(
      await (
        await fetch(
          `http://localhost:${port}${HTTP_API_BASE_PATH}/snapshot-webhook`,
          {method: HTTPMethod.POST}
        )
      ).status
    ).toBe(202);

    // Cleanup
    consoleWarnSpy.mockRestore();
  });
  
  test('should return 500 error code', async () => {
    const {port} = server?.address() as AddressInfo;
    
    const proposalEventRunner =  await import('../../webhook-tasks/runners/snapshotHub/proposalEventRunner')

    // Temporarily hide warnings from `msw`
    const consoleWarnSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => {});
      
    // Temporarily hide warnings from `msw`
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const proposalEventRunnerSpy = jest
      .spyOn(proposalEventRunner, 'snapshotProposalEventRunner')
      .mockImplementation(async () => {throw new Error('Some bad error.');});

    expect(
      await (
        await fetch(
          `http://localhost:${port}${HTTP_API_BASE_PATH}/snapshot-webhook`,
          {method: HTTPMethod.POST, body: JSON.stringify({test: 'cool'}), headers: {
            'Content-Type': "application/json"
          }}
        )
      ).status
    ).toBe(500);

    // Cleanup
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    proposalEventRunnerSpy.mockRestore();
  });
});
