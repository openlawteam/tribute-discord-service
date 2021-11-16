import {DiscordWebhook} from '@prisma/client';
import {WebhookClient} from 'discord.js';

import {
  BYTES32_FIXTURE,
  DISCORD_WEBHOOK_POST_FIXTURE,
  ETH_ADDRESS_FIXTURE,
  FAKE_DAOS_FIXTURE,
  LEGACY_TRIBUTE_SNAPSHOT_HUB_PROPOSAL_FIXTURE,
} from '../../../../test';
import {ActionNames, DaoData} from '../../../config';
import {EventBase} from '../../events';
import {legacyTributeGovernanceProposalCreatedWebhookAction} from './legacyTributeGovernanceProposalCreatedWebhook';
import {mockWeb3Provider} from '../../../../test/setup';
import {prismaMock} from '../../../../test/prismaMock';
import {SNAPSHOT_PROPOSAL_CREATED_EVENT} from '../../events/snapshotHub';
import {SnapshotHubEventPayload, SnapshotHubEvents} from './types';
import {web3} from '../../../singletons';
import {rest, server} from '../../../../test/msw/server';
import {SnapshotHubLegacyTributeProposalEntry} from '../../../services/snapshotHub';
import {BURN_ADDRESS} from '../../../helpers';
import {
  compileSimpleTemplate,
  SnapshotProposalCreatedEmbedTemplateData,
  SnapshotProposalCreatedFallbackTemplateData,
  SnapshotProposalCreatedTemplateData,
  SNAPSHOT_GOVERNANCE_PROPOSAL_CREATED_TEMPLATE,
  SNAPSHOT_PROPOSAL_CREATED_EMBED_TEMPLATE,
  SNAPSHOT_PROPOSAL_CREATED_FALLBACK_TEMPLATE,
} from '../../templates';

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

  // Mock respsonse for `proposals`
  mockWeb3Provider.injectResult(
    web3.eth.abi.encodeParameters(
      ['address', 'uint256'],
      [ETH_ADDRESS_FIXTURE, 1]
    )
  );

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

const mockGovernanceProposalResponse = () =>
  server.use(
    rest.get<undefined, SnapshotHubLegacyTributeProposalEntry>(
      'http://*/api/*/proposal/*',
      (_req, res, ctx) =>
        res(
          ctx.json({
            ...LEGACY_TRIBUTE_SNAPSHOT_HUB_PROPOSAL_FIXTURE,
            [BYTES32_FIXTURE]: {
              ...LEGACY_TRIBUTE_SNAPSHOT_HUB_PROPOSAL_FIXTURE[BYTES32_FIXTURE],
              actionId: BURN_ADDRESS,
            },
          })
        )
    )
  );

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

const FAKE_DAOS_FIXTURE_GOVERNANCE: Record<string, DaoData> = {
  ...FAKE_DAOS_FIXTURE,
  test: {
    ...FAKE_DAOS_FIXTURE.test,
    actions: [
      ...FAKE_DAOS_FIXTURE.test.actions,
      {name: 'SNAPSHOT_PROPOSAL_CREATED_WEBHOOK', webhookID: 'abc123'},
    ],
    adapters: {
      ...FAKE_DAOS_FIXTURE.test.adapters,
      [BURN_ADDRESS]: {
        friendlyName: 'Governance',
        baseURLPath: 'governance',
      },
    },
    events: [
      ...FAKE_DAOS_FIXTURE.test.events,
      {name: 'SNAPSHOT_PROPOSAL_CREATED'},
    ],
  },
};

describe('legacyTributeGovernanceProposalCreatedWebhookAction unit tests', () => {
  test('should send Discord webhook message', async () => {
    mockGovernanceProposalResponse();

    const {cleanup, sendSpy} = await mockHelper();

    await legacyTributeGovernanceProposalCreatedWebhookAction(
      SNAPSHOT_PROPOSAL_CREATED_EVENT,
      FAKE_DAOS_FIXTURE_GOVERNANCE
    )(EVENT_DATA);

    // Assert OK and `WebhookClient.send` called
    expect(sendSpy?.mock.calls.length).toBe(1);

    expect(sendSpy?.mock.calls[0][0]?.content).toBe(
      compileSimpleTemplate<SnapshotProposalCreatedTemplateData>(
        SNAPSHOT_GOVERNANCE_PROPOSAL_CREATED_TEMPLATE,
        {
          proposalURL: `http://localhost:3000/governance/${BYTES32_FIXTURE}`,
          title:
            LEGACY_TRIBUTE_SNAPSHOT_HUB_PROPOSAL_FIXTURE[BYTES32_FIXTURE].msg
              .payload.name,
        }
      )
    );

    expect(sendSpy?.mock.calls[0][0]?.embeds).toEqual([
      {
        color: 'DEFAULT',
        description:
          compileSimpleTemplate<SnapshotProposalCreatedEmbedTemplateData>(
            SNAPSHOT_PROPOSAL_CREATED_EMBED_TEMPLATE,
            {
              body: LEGACY_TRIBUTE_SNAPSHOT_HUB_PROPOSAL_FIXTURE[
                BYTES32_FIXTURE
              ].msg.payload.body,
            }
          ),
      },
    ]);

    expect(sendSpy?.mock.calls[0][0]?.username).toEqual(
      FAKE_DAOS_FIXTURE.test.friendlyName
    );

    cleanup();
  });

  test('should send Discord webhook fallback message', async () => {
    server.use(
      rest.get<undefined, SnapshotHubLegacyTributeProposalEntry>(
        'http://*/api/*/proposal/*',
        (_req, res, ctx) => res(ctx.json({}))
      )
    );

    const {cleanup, sendSpy} = await mockHelper();

    await legacyTributeGovernanceProposalCreatedWebhookAction(
      SNAPSHOT_PROPOSAL_CREATED_EVENT,
      FAKE_DAOS_FIXTURE_GOVERNANCE
    )(EVENT_DATA);

    // Assert OK and `WebhookClient.send` called
    expect(sendSpy?.mock.calls.length).toBe(1);

    expect(sendSpy?.mock.calls[0][0]?.content).toBe(
      compileSimpleTemplate<SnapshotProposalCreatedFallbackTemplateData>(
        SNAPSHOT_PROPOSAL_CREATED_FALLBACK_TEMPLATE,
        {
          baseURL: FAKE_DAOS_FIXTURE.test.baseURL,
          friendlyName: FAKE_DAOS_FIXTURE.test.friendlyName,
        }
      )
    );

    expect(sendSpy?.mock.calls[0][0]?.embeds).toEqual([]);
    expect(sendSpy?.mock.calls[0][0]?.username).toEqual(
      FAKE_DAOS_FIXTURE.test.friendlyName
    );

    cleanup();
  });

  test('should send Discord webhook message and log with `DEBUG=true`', async () => {
    const consoleDebugOriginal = console.debug;
    const consoleDebugSpy = (console.debug = jest.fn());

    mockGovernanceProposalResponse();

    // Don't mock the client so we can inspect the response
    const {cleanup} = await mockHelper(false);

    const isDebugSpy = jest
      .spyOn(await import('../../../helpers/isDebug'), 'isDebug')
      .mockImplementation(() => true);

    await legacyTributeGovernanceProposalCreatedWebhookAction(
      SNAPSHOT_PROPOSAL_CREATED_EVENT,
      FAKE_DAOS_FIXTURE_GOVERNANCE
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

    mockGovernanceProposalResponse();

    const {cleanup, errorHandlerSpy, sendSpy} = await mockHelper(false);

    let assertError;

    try {
      await legacyTributeGovernanceProposalCreatedWebhookAction(
        SNAPSHOT_PROPOSAL_CREATED_EVENT,
        FAKE_DAOS_FIXTURE_GOVERNANCE
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

    await legacyTributeGovernanceProposalCreatedWebhookAction(
      SNAPSHOT_PROPOSAL_CREATED_EVENT,
      FAKE_DAOS_FIXTURE_GOVERNANCE
    )(undefined as any);

    // Assert no `WebhookClient.send` called
    expect(sendSpy?.mock.calls.length).toBe(0);
    // Assert exit early
    expect(getDaoDataByAddressSpy?.mock.calls.length).toBe(0);

    cleanup();
    getDaoDataByAddressSpy.mockRestore();
  });

  test('should exit if `snapshotEvent.event !== event.snapshotEventName`', async () => {
    const getDaoAction = await import('../../../helpers/getDaoAction');
    const {cleanup, sendSpy} = await mockHelper();

    const getDaoDataByAddressSpy = jest.spyOn(getDaoAction, 'getDaoAction');

    await legacyTributeGovernanceProposalCreatedWebhookAction(
      SNAPSHOT_PROPOSAL_CREATED_EVENT,
      FAKE_DAOS_FIXTURE_GOVERNANCE
    )({...EVENT_DATA, event: SnapshotHubEvents.PROPOSAL_END});

    // Assert no `WebhookClient.send` called
    expect(sendSpy?.mock.calls.length).toBe(0);
    // Assert exit early
    expect(getDaoDataByAddressSpy?.mock.calls.length).toBe(0);

    cleanup();
    getDaoDataByAddressSpy.mockRestore();
  });

  test('should exit if proposal is not governance', async () => {
    // Let the default, non-governance msw mock run for a snapshot hub propsosal

    const {cleanup, sendSpy} = await mockHelper();

    await legacyTributeGovernanceProposalCreatedWebhookAction(
      SNAPSHOT_PROPOSAL_CREATED_EVENT,
      FAKE_DAOS_FIXTURE_GOVERNANCE
    )(EVENT_DATA);

    // Assert OK and `WebhookClient.send` called
    expect(sendSpy?.mock.calls.length).toBe(0);

    cleanup();
  });

  test('should exit if action is not active', async () => {
    const FAKE_DAOS_NO_ACTION: Record<string, DaoData> = {
      ...FAKE_DAOS_FIXTURE,
      test: {
        ...FAKE_DAOS_FIXTURE.test,
        actions: [
          ...FAKE_DAOS_FIXTURE.test.actions,
          // Not the correct action
          {
            name: 'SNAPSHOT_PROPOSAL_END_WEBHOOK',
            webhookID: 'abc123',
          },
        ],
        adapters: {
          ...FAKE_DAOS_FIXTURE.test.adapters,
          [BURN_ADDRESS]: {
            friendlyName: 'Governance',
            baseURLPath: 'governance',
          },
        },
        events: [
          ...FAKE_DAOS_FIXTURE.test.events,
          {name: 'SNAPSHOT_PROPOSAL_CREATED'},
        ],
      },
    };

    mockGovernanceProposalResponse();

    const {cleanup, sendSpy} = await mockHelper();

    await legacyTributeGovernanceProposalCreatedWebhookAction(
      SNAPSHOT_PROPOSAL_CREATED_EVENT,
      FAKE_DAOS_NO_ACTION
    )(EVENT_DATA);

    // Assert OK and `WebhookClient.send` called
    expect(sendSpy?.mock.calls.length).toBe(0);

    cleanup();
  });
});
