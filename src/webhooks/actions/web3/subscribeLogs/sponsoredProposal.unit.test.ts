import {DiscordWebhook} from '@prisma/client';
import {WebhookClient} from 'discord.js';

import {
  DISCORD_WEBHOOK_POST_FIXTURE,
  EMPTY_BYTES32_FIXTURE,
  ETH_ADDRESS_FIXTURE,
  FAKE_DAOS_FIXTURE,
} from '../../../../../test';
import {EventBase, SPONSORED_PROPOSAL_WEB3_LOGS} from '../../../events';
import {mockWeb3Provider} from '../../../../../test/setup';
import {prismaMock} from '../../../../../test/prismaMock';
import {rest, server} from '../../../../../test/msw/server';
import {sponsoredProposalActionSubscribeLogs} from './sponsoredProposal';
import {web3} from '../../../../alchemyWeb3Instance';

type MockHelperReturn = Promise<{
  cleanup: () => void;

  consoleLogSpy: jest.SpyInstance<
    void,
    [message?: any, ...optionalParams: any[]]
  >;

  errorHandlerSpy: jest.SpyInstance<
    void,
    [
      {
        actionName: 'sponsoredProposalSubscribeLogs';
        event: EventBase;
        error: Error;
      }
    ]
  >;

  sendSpy?: jest.Mock<any, any>;

  webhookClientMock?: jest.SpyInstance<
    Promise<WebhookClient>,
    [webhookID: string]
  >;
}>;

const EVENT_DATA = {
  address: ETH_ADDRESS_FIXTURE,
  topics: [
    '0x5b96711deea669ec50fcc8f3d230291ab4711de1d67a0747e6de4ae6c4263d7c',
  ],
  data: '0x94fd601ac03ccc41ef4bab53dcd7c0d91b32669408ae5cbe4df972322c2eb47e00000000000000000000000000000000000000000000000000000000000000030000000000000000000000007116c8bebfdf9109aa9d1f188f3025a7f267c095',
  blockNumber: 9297936,
  transactionHash:
    '0x4fc955a5904642c70a0256eac2684ff3cadda36eac919822b565d2f9ba87084e',
  transactionIndex: 38,
  blockHash:
    '0xc4edc2196eb48e1da49c21da02dd7b60ec7435e711a33756e1b9a8befe948cd6',
  logIndex: 48,
};

async function mockHelper(
  spyOnWebhookClient: boolean = true
): MockHelperReturn {
  let webhookClientMock:
    | jest.SpyInstance<Promise<WebhookClient>, [webhookID: string]>
    | undefined;

  let sendSpy: jest.Mock<any, any> | undefined;

  const webhook: DiscordWebhook = {
    id: 1,
    createdAt: new Date(0),
    webhookID: 'abc123',
    webhookToken: 'def456',
    name: 'A Test Webhook',
  };

  // Spy on logging for test

  const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

  const actionErrorHandler = await import('../../helpers/actionErrorHandler');

  const errorHandlerSpy = jest
    .spyOn(actionErrorHandler, 'actionErrorHandler')
    // Noop function to remove implementation, i.e. noisy error logs
    .mockImplementation(() => {});

  // Mock result
  prismaMock.discordWebhook.findUnique.mockResolvedValue(webhook);

  if (spyOnWebhookClient) {
    // Mock Discord.js `WebhookClient.send`
    const getDiscordWebhookClient = await import(
      '../../../../services/discord/getDiscordWebhookClient'
    );

    sendSpy = jest.fn();

    webhookClientMock = jest
      .spyOn(getDiscordWebhookClient, 'getDiscordWebhookClient')
      .mockImplementation(async () => ({send: sendSpy} as any));
  }

  // Mock respsonse for `proposals`
  mockWeb3Provider.injectResult(
    web3.eth.abi.encodeParameters(
      ['address', 'uint256'],
      [ETH_ADDRESS_FIXTURE, 1]
    )
  );

  // Mock respsonse for `inverseAdapters`
  mockWeb3Provider.injectResult(
    web3.eth.abi.encodeParameters(
      ['bytes32', 'uint256'],
      [EMPTY_BYTES32_FIXTURE, 1]
    )
  );

  return {
    cleanup: () => {
      sendSpy?.mockReset();
      webhookClientMock?.mockRestore();
      errorHandlerSpy.mockRestore();
    },
    consoleLogSpy,
    errorHandlerSpy,
    sendSpy,
    webhookClientMock,
  };
}

describe('sponsoredProposal unit tests', () => {
  test('should send Discord webhook message', async () => {
    const {cleanup, sendSpy} = await mockHelper();

    await sponsoredProposalActionSubscribeLogs(
      SPONSORED_PROPOSAL_WEB3_LOGS,
      FAKE_DAOS_FIXTURE
    )(EVENT_DATA);

    // Assert OK and `WebhookClient.send` called
    expect(sendSpy?.mock.calls.length).toBe(1);

    cleanup();
  });

  test('should send Discord webhook message and log with `DEBUG=true`', async () => {
    // Don't mock the client
    const {cleanup, consoleLogSpy} = await mockHelper(false);

    const originalDEBUG = process.env.DEBUG;

    process.env.DEBUG = 'true';

    await sponsoredProposalActionSubscribeLogs(
      SPONSORED_PROPOSAL_WEB3_LOGS,
      FAKE_DAOS_FIXTURE
    )(EVENT_DATA);

    expect(consoleLogSpy.mock.calls.length).toBe(1);

    expect(consoleLogSpy.mock.calls[0][0]).toMatch(
      /sent discord message after sponsored_proposal event for tribute dao \[test\]/i
    );

    expect(consoleLogSpy.mock.calls[0][0]).toContain(
      JSON.stringify(DISCORD_WEBHOOK_POST_FIXTURE, null, 2)
    );

    // Cleanup

    cleanup();

    process.env.DEBUG = originalDEBUG;
  });

  test('should not throw on Discord POST error', async () => {
    // Mock response error
    server.use(
      rest.post('https://discord.com/api/*/webhooks/*/*', (_req, res, ctx) =>
        res(ctx.status(500))
      )
    );

    const {cleanup, errorHandlerSpy, sendSpy} = await mockHelper(false);

    let assertError;

    try {
      await sponsoredProposalActionSubscribeLogs(
        SPONSORED_PROPOSAL_WEB3_LOGS,
        FAKE_DAOS_FIXTURE
      )(EVENT_DATA);
    } catch (error) {
      assertError = error;
    }

    // Assert OK
    expect(sendSpy?.mock.calls).toBe(undefined);
    // Assert error logging was called
    expect(errorHandlerSpy.mock.calls.length).toBe(1);
    // Assert error was not thrown
    expect(assertError).not.toBeDefined();

    // Cleanup

    cleanup();
  });

  test('should not throw on Web3 call error', async () => {
    // Mock Web3 error
    mockWeb3Provider.injectError({code: 123, message: 'Some bad error.'});

    const {cleanup, errorHandlerSpy, sendSpy} = await mockHelper();

    let assertError;

    try {
      await sponsoredProposalActionSubscribeLogs(
        SPONSORED_PROPOSAL_WEB3_LOGS,
        FAKE_DAOS_FIXTURE
      )(EVENT_DATA);
    } catch (error) {
      assertError = error;
    }

    // Assert OK and `WebhookClient.send` not called
    expect(sendSpy?.mock.calls.length).toBe(0);
    // Assert error logging was called
    expect(errorHandlerSpy.mock.calls.length).toBe(1);
    // Assert error was not thrown
    expect(assertError).not.toBeDefined();

    cleanup();
  });
});
