import {AddressInfo} from 'node:net';
import fetch from 'node-fetch';

import {BYTES32_FIXTURE, UUID_FIXTURE} from '../../../../test/fixtures';
import {HTTP_API_BASE_PATH} from '../../config';
import {httpServer} from '../..';
import {prismaMock} from '../../../../test/prismaMock';
import {TributeToolsWebhookTxType} from '../../types';

describe('tributeToolsGetTx unit tests', () => {
  const server = httpServer({noLog: true, useAnyAvailablePort: true});

  function zodErrorHelper(errorMessage: string): Record<string, any>[] {
    const errors = errorMessage.split(
      /Invalid parameters provided to \/tx\/:type\/:uuid:/i
    )[1];

    return JSON.parse(errors);
  }

  afterAll(async () => {
    await server?.close();
  });

  test('should return result', async () => {
    const {port} = server?.address() as AddressInfo;

    /**
     * Mock results
     *
     * @todo Fix types
     */

    const buyNFTPollSpy = (
      prismaMock.buyNFTPoll as any
    ).findUnique.mockResolvedValue({
      txStatus: 'success',
      txHash: BYTES32_FIXTURE,
    });

    const sweepNFTPollSpy = (
      prismaMock.floorSweeperPoll as any
    ).findUnique.mockResolvedValue({
      txStatus: 'success',
      txHash:
        '0x295cc18927e6cf72bf0103c9df4ec3507f76ea1a42721be38ee5cc8a0cd627da',
    });

    const fundNFTPollSpy = (
      prismaMock.fundAddressPoll as any
    ).findUnique.mockResolvedValue({
      txStatus: 'success',
      txHash:
        '0x70477c8ad25fc880f2ad49c09c4c04ca8e4a31082ae36214c80044e045f4f549',
    });

    // Temporarily hide warnings from `msw`
    const consoleWarnSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => {});

    // Assert buy result
    expect(
      await (
        await fetch(
          `http://localhost:${port}${HTTP_API_BASE_PATH}/tribute-tools/tx/${TributeToolsWebhookTxType.BUY}/${UUID_FIXTURE}`
        )
      ).json()
    ).toEqual({
      txStatus: 'success',
      txHash:
        '0xfe837a5e727dacac34d8070a94918f13335f255f9bbf958d876718aac64b299d',
    });

    // Assert sweep result
    expect(
      await (
        await fetch(
          `http://localhost:${port}${HTTP_API_BASE_PATH}/tribute-tools/tx/${TributeToolsWebhookTxType.SWEEP}/${UUID_FIXTURE}`
        )
      ).json()
    ).toEqual({
      txStatus: 'success',
      txHash:
        '0x295cc18927e6cf72bf0103c9df4ec3507f76ea1a42721be38ee5cc8a0cd627da',
    });

    // Assert fund result
    expect(
      await (
        await fetch(
          `http://localhost:${port}${HTTP_API_BASE_PATH}/tribute-tools/tx/${TributeToolsWebhookTxType.FUND}/${UUID_FIXTURE}`
        )
      ).json()
    ).toEqual({
      txStatus: 'success',
      txHash:
        '0x70477c8ad25fc880f2ad49c09c4c04ca8e4a31082ae36214c80044e045f4f549',
    });

    // Cleanup

    buyNFTPollSpy.mockRestore();
    fundNFTPollSpy.mockRestore();
    sweepNFTPollSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  test('should return not found', async () => {
    const {port} = server?.address() as AddressInfo;

    /**
     * Mock result
     *
     * @todo Fix types
     */
    const buyNFTPollSpy = (
      prismaMock.buyNFTPoll as any
    ).findUnique.mockResolvedValue(undefined);

    // Temporarily hide warnings from `msw`
    const consoleWarnSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => {});

    // Assert result
    expect(
      await (
        await fetch(
          `http://localhost:${port}${HTTP_API_BASE_PATH}/tribute-tools/tx/${TributeToolsWebhookTxType.BUY}/${UUID_FIXTURE}`
        )
      ).json()
    ).toEqual({
      error: {
        message: 'The transaction was not found.',
        status: 404,
      },
    });

    // Cleanup

    buyNFTPollSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  test('should return bad request if params are not valid', async () => {
    const {port} = server?.address() as AddressInfo;

    /**
     * Mock result
     *
     * @todo Fix types
     */
    const buyNFTPollSpy = (
      prismaMock.buyNFTPoll as any
    ).findUnique.mockResolvedValue({
      error: {
        message: 'The provided parameters are invalid.',
        status: 400,
      },
    });

    // Temporarily hide warnings from `msw`
    const consoleWarnSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => {});

    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    expect(
      await (
        await fetch(
          `http://localhost:${port}${HTTP_API_BASE_PATH}/tribute-tools/tx/${TributeToolsWebhookTxType.BUY}/bad-uuid`
        )
      ).json()
    ).toEqual({
      error: {
        message: 'The provided parameters are invalid.',
        status: 400,
      },
    });

    // Assert `:uuid` param invalid
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

    expect(zodErrorHelper(consoleErrorSpy.mock.calls[0][0])).toEqual([
      {
        validation: 'uuid',
        code: 'invalid_string',
        message: 'Invalid uuid',
        path: ['uuid'],
      },
    ]);

    expect(
      await (
        await fetch(
          `http://localhost:${port}${HTTP_API_BASE_PATH}/tribute-tools/tx/bad-type/${UUID_FIXTURE}`
        )
      ).json()
    ).toEqual({
      error: {
        message: 'The provided parameters are invalid.',
        status: 400,
      },
    });

    // Assert `:type` param invalid
    expect(zodErrorHelper(consoleErrorSpy.mock.calls[1][0])).toEqual([
      {
        code: 'invalid_enum_value',
        message: "Invalid enum value. Expected 'singleBuy' | 'fund' | 'sweep'",
        options: ['singleBuy', 'fund', 'sweep'],
        path: ['type'],
      },
    ]);

    // Assert log call count
    expect(consoleErrorSpy).toHaveBeenCalledTimes(2);

    // Cleanup

    buyNFTPollSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  test('should return server error', async () => {
    const {port} = server?.address() as AddressInfo;

    /**
     * Mock result
     *
     * @todo Fix types
     */
    const buyNFTPollSpy = (
      prismaMock.buyNFTPoll as any
    ).findUnique.mockImplementation(() => {
      throw new Error('Some bad error.');
    });

    // Temporarily hide warnings from `msw`
    const consoleWarnSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => {});

    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    // Assert result
    expect(
      await (
        await fetch(
          `http://localhost:${port}${HTTP_API_BASE_PATH}/tribute-tools/tx/${TributeToolsWebhookTxType.BUY}/${UUID_FIXTURE}`
        )
      ).json()
    ).toEqual({
      error: {
        message: `Something went wrong while getting the transaction data for type \`${TributeToolsWebhookTxType.BUY}\` uuid \`02458ff0-4cc5-4137-bcf5-ef91053ab811\`.`,
        status: 500,
      },
    });

    // Assert `console.error`
    expect(consoleErrorSpy).toHaveBeenCalledTimes(2);

    expect(consoleErrorSpy.mock.calls[0][0]?.message).toMatch(
      /some bad error/i
    );

    expect(consoleErrorSpy.mock.calls[1][0]).toMatch(
      /HTTP API Error from \/api\/tribute-tools\/tx\/singleBuy\/02458ff0-4cc5-4137-bcf5-ef91053ab811 Error: Something went wrong while getting the transaction data for type \`singleBuy\` uuid `02458ff0-4cc5-4137-bcf5-ef91053ab811\`\./i
    );

    // Cleanup

    buyNFTPollSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });
});
