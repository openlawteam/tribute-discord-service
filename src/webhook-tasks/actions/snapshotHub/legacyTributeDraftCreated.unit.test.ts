import {DiscordWebhook} from '@prisma/client';
import {WebhookClient} from 'discord.js';

import {
  BYTES32_FIXTURE,
  DISCORD_WEBHOOK_POST_FIXTURE,
  FAKE_DAOS_FIXTURE,
  LEGACY_TRIBUTE_SNAPSHOT_HUB_DRAFT_FIXTURE,
} from '../../../../test';
import {
  compileSimpleTemplate,
  SNAPSHOT_DRAFT_CREATED_EMBED_TEMPLATE,
  SNAPSHOT_DRAFT_CREATED_TEMPLATE,
  SnapshotDraftCreatedEmbedTemplateData,
  SnapshotDraftCreatedTemplateData,
} from '../../templates';
import {ActionNames, DaoEntityConfig} from '../../../config';
import {BURN_ADDRESS} from '../../../helpers';
import {EventBase} from '../../events';
import {legacyTributeDraftCreatedAction} from './legacyTributeDraftCreated';
import {mockWeb3Provider} from '../../../../test/setup';
import {prismaMock} from '../../../../test/prismaMock';
import {rest, server} from '../../../../test/msw/server';
import {SNAPSHOT_PROPOSAL_CREATED_EVENT} from '../../events/snapshotHub';
import {SnapshotHubEventPayload, SnapshotHubEvents} from './types';
import {
  SnapshotHubLegacyTributeDraftEntry,
  SnapshotHubMessageType,
} from '../../../services/snapshotHub';
import {web3} from '../../../singletons';

type MockHelperReturn = Promise<{
  cleanup: () => void;

  errorHandlerSpy: jest.SpyInstance<
    void,
    [
      {
        actionName: ActionNames;
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

  const actionErrorHandler = await import('../helpers/actionErrorHandler');

  const errorHandlerSpy = jest
    .spyOn(actionErrorHandler, 'actionErrorHandler')
    // Noop function to remove implementation, i.e. noisy error logs
    .mockImplementation(() => {});

  // Mock result
  prismaMock.discordWebhook.findUnique.mockResolvedValue(webhook);

  if (spyOnWebhookClient) {
    // Mock Discord.js `WebhookClient.send`
    const getDiscordWebhookClient = await import(
      '../../../services/discord/getDiscordWebhookClient'
    );

    sendSpy = jest.fn();

    webhookClientMock = jest
      .spyOn(getDiscordWebhookClient, 'getDiscordWebhookClient')
      .mockImplementation(async () => ({send: sendSpy} as any));
  }

  // Mock respsonse for `inverseAdapters`
  mockWeb3Provider.injectResult(
    web3.eth.abi.encodeParameters(['bytes32', 'uint256'], [BYTES32_FIXTURE, 1])
  );

  return {
    cleanup: () => {
      sendSpy?.mockReset();
      webhookClientMock?.mockRestore();
      errorHandlerSpy.mockRestore();
    },
    errorHandlerSpy,
    sendSpy,
    webhookClientMock,
  };
}

const EVENT_DATA: SnapshotHubEventPayload = {
  event: SnapshotHubEvents.PROPOSAL_CREATED,
  expire: new Date(0).getTime() / 1000,
  /**
   * Proposal's ID string
   */
  id: `proposal/${BYTES32_FIXTURE}`,
  /**
   * Name of Snapshot Hub space
   *
   * e.g. 'fashion'
   */
  space: 'tribute',
};

const FAKE_DAOS: Record<string, DaoEntityConfig> = {
  ...FAKE_DAOS_FIXTURE,
  test: {
    ...FAKE_DAOS_FIXTURE.test,
    actions: [
      ...FAKE_DAOS_FIXTURE.test.actions,
      {name: 'SNAPSHOT_DRAFT_CREATED_WEBHOOK', webhookID: 'abc123'},
    ],
    events: [
      ...FAKE_DAOS_FIXTURE.test.events,
      {name: 'SNAPSHOT_PROPOSAL_CREATED'},
    ],
  },
};

describe('legacyTributeDraftCreatedAction unit tests', () => {
  test('should send Discord webhook message', async () => {
    const {cleanup, sendSpy} = await mockHelper();

    await legacyTributeDraftCreatedAction(
      SNAPSHOT_PROPOSAL_CREATED_EVENT,
      FAKE_DAOS
    )(EVENT_DATA);

    // Assert OK and `WebhookClient.send` called
    expect(sendSpy?.mock.calls.length).toBe(1);

    expect(sendSpy?.mock.calls[0][0]?.content).toBe(
      compileSimpleTemplate<SnapshotDraftCreatedTemplateData>(
        SNAPSHOT_DRAFT_CREATED_TEMPLATE,
        {
          createdDateUTCString: new Date(0 * 1000).toUTCString(),
          draftURL: `http://localhost:3000/membership/${BYTES32_FIXTURE}`,
          title:
            LEGACY_TRIBUTE_SNAPSHOT_HUB_DRAFT_FIXTURE[BYTES32_FIXTURE].msg
              .payload.name,
        }
      )
    );

    expect(sendSpy?.mock.calls[0][0]?.embeds).toEqual([
      {
        color: 'DEFAULT',
        description:
          compileSimpleTemplate<SnapshotDraftCreatedEmbedTemplateData>(
            SNAPSHOT_DRAFT_CREATED_EMBED_TEMPLATE,
            {
              body: LEGACY_TRIBUTE_SNAPSHOT_HUB_DRAFT_FIXTURE[BYTES32_FIXTURE]
                .msg.payload.body,
            }
          ),
      },
    ]);

    expect(sendSpy?.mock.calls[0][0]?.username).toEqual(
      FAKE_DAOS.test.friendlyName
    );

    cleanup();
  });

  test('should send Discord webhook message and log with `DEBUG=true`', async () => {
    const consoleDebugOriginal = console.debug;
    const consoleDebugSpy = (console.debug = jest.fn());

    // Don't mock the client so we can inspect the response
    const {cleanup} = await mockHelper(false);

    const isDebugSpy = jest
      .spyOn(await import('../../../helpers/isDebug'), 'isDebug')
      .mockImplementation(() => true);

    await legacyTributeDraftCreatedAction(
      SNAPSHOT_PROPOSAL_CREATED_EVENT,
      FAKE_DAOS
    )(EVENT_DATA);

    expect(consoleDebugSpy.mock.calls.length).toBe(1);

    expect(consoleDebugSpy.mock.calls[0][0]).toMatch(
      /sent discord message after snapshot_proposal_created event for tribute dao \[test\]/i
    );

    expect(consoleDebugSpy.mock.calls[0][0]).toContain(
      JSON.stringify(DISCORD_WEBHOOK_POST_FIXTURE, null, 2)
    );

    // Cleanup

    cleanup();

    consoleDebugSpy.mockReset();
    console.debug = consoleDebugOriginal;
    isDebugSpy.mockRestore();
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
      await legacyTributeDraftCreatedAction(
        SNAPSHOT_PROPOSAL_CREATED_EVENT,
        FAKE_DAOS
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

  test('should exit if no `snapshotEvent`', async () => {
    const getDaoAction = await import('../../../helpers/getDaoAction');
    const {cleanup, sendSpy} = await mockHelper();

    const getDaoDataByAddressSpy = jest.spyOn(getDaoAction, 'getDaoAction');

    await legacyTributeDraftCreatedAction(
      SNAPSHOT_PROPOSAL_CREATED_EVENT,
      FAKE_DAOS
    )(undefined as any);

    // Assert no `WebhookClient.send` called
    expect(sendSpy?.mock.calls.length).toBe(0);
    // Assert exit early
    expect(getDaoDataByAddressSpy?.mock.calls.length).toBe(0);

    cleanup();
    getDaoDataByAddressSpy.mockRestore();
  });

  test('should exit if no draft found', async () => {
    // Mock empty response
    server.use(
      rest.get('http://*/api/*/draft/*', (_req, res, ctx) => res(ctx.json({})))
    );

    const {cleanup, sendSpy} = await mockHelper();

    let assertError;

    try {
      await legacyTributeDraftCreatedAction(
        SNAPSHOT_PROPOSAL_CREATED_EVENT,
        FAKE_DAOS
      )(EVENT_DATA);
    } catch (error) {
      assertError = error;
    }

    // Assert no `WebhookClient.send` called
    expect(sendSpy?.mock.calls.length).toBe(0);
    // Assert error was not thrown
    expect(assertError).not.toBeDefined();

    // Cleanup

    cleanup();
  });

  test('should exit if no `adapterID` found', async () => {
    server.use(
      rest.get<undefined, SnapshotHubLegacyTributeDraftEntry>(
        'http://*/api/*/draft/*',
        (_req, res, ctx) =>
          res(
            ctx.json({
              ...LEGACY_TRIBUTE_SNAPSHOT_HUB_DRAFT_FIXTURE,
              [BYTES32_FIXTURE]: {
                ...LEGACY_TRIBUTE_SNAPSHOT_HUB_DRAFT_FIXTURE[BYTES32_FIXTURE],
                // Use an empty `actionId` in order to trigger exit
                actionId: '',
              },
            })
          )
      )
    );

    const {cleanup, sendSpy} = await mockHelper();

    let assertError;

    try {
      await legacyTributeDraftCreatedAction(
        SNAPSHOT_PROPOSAL_CREATED_EVENT,
        FAKE_DAOS
      )(EVENT_DATA);
    } catch (error) {
      assertError = error;
    }

    // Assert no `WebhookClient.send` called
    expect(sendSpy?.mock.calls.length).toBe(0);
    // Assert error was not thrown
    expect(assertError).not.toBeDefined();

    // Cleanup

    cleanup();
  });

  test('should exit if response type is not `SnapshotHubMessageType.DRAFT`', async () => {
    // Mock empty response
    server.use(
      rest.get('http://*/api/*/draft/*', (_req, res, ctx) =>
        res(
          ctx.json({
            ...LEGACY_TRIBUTE_SNAPSHOT_HUB_DRAFT_FIXTURE,
            [BYTES32_FIXTURE]: {
              ...LEGACY_TRIBUTE_SNAPSHOT_HUB_DRAFT_FIXTURE[BYTES32_FIXTURE],
              actionId: BURN_ADDRESS,
              msg: {
                ...LEGACY_TRIBUTE_SNAPSHOT_HUB_DRAFT_FIXTURE[BYTES32_FIXTURE]
                  .msg,
                // Wrong type
                type: SnapshotHubMessageType.PROPOSAL,
              },
            },
          })
        )
      )
    );

    const {cleanup, sendSpy} = await mockHelper();

    let assertError;

    try {
      await legacyTributeDraftCreatedAction(
        SNAPSHOT_PROPOSAL_CREATED_EVENT,
        FAKE_DAOS
      )(EVENT_DATA);
    } catch (error) {
      assertError = error;
    }

    // Assert no `WebhookClient.send` called
    expect(sendSpy?.mock.calls.length).toBe(0);
    // Assert error was not thrown
    expect(assertError).not.toBeDefined();

    // Cleanup

    cleanup();
  });

  test('should exit if `snapshotEvent.event !== event.snapshotEventName`', async () => {
    const getDaoAction = await import('../../../helpers/getDaoAction');
    const {cleanup, sendSpy} = await mockHelper();

    const getDaoDataByAddressSpy = jest.spyOn(getDaoAction, 'getDaoAction');

    await legacyTributeDraftCreatedAction(
      SNAPSHOT_PROPOSAL_CREATED_EVENT,
      FAKE_DAOS
    )({...EVENT_DATA, event: SnapshotHubEvents.PROPOSAL_END});

    // Assert no `WebhookClient.send` called
    expect(sendSpy?.mock.calls.length).toBe(0);
    // Assert exit early
    expect(getDaoDataByAddressSpy?.mock.calls.length).toBe(0);

    cleanup();
    getDaoDataByAddressSpy.mockRestore();
  });

  test('should exit if action is not active', async () => {
    const getProposalAdapterID = await import(
      '../../../services/dao/getProposalAdapterID'
    );

    const getProposalAdapterIDMock = jest
      .spyOn(getProposalAdapterID, 'getProposalAdapterID')
      .mockImplementation(async () => undefined);

    const {cleanup, sendSpy} = await mockHelper();

    await legacyTributeDraftCreatedAction(
      SNAPSHOT_PROPOSAL_CREATED_EVENT,
      FAKE_DAOS
    )(EVENT_DATA);

    // Assert OK and `WebhookClient.send` called
    expect(sendSpy?.mock.calls.length).toBe(0);

    cleanup();
    getProposalAdapterIDMock.mockRestore();
  });
});
