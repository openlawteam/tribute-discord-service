import {APIMessage} from 'discord-api-types';

import {DEFAULT_EMPTY_BYTES32} from '..';
import {rest} from './server';
import {SnapshotHubLegacyTributeProposalEntry} from '../../src/services/snapshotHub';

/**
 * Alchemy API
 */

const alchemyAPI = rest.get(
  'https://eth-*.alchemyapi.io/v2/*',
  // Just responding with something so the msw doesn't log a warning
  (_req, res, ctx) => res(ctx.status(200))
);

/**
 * Discord.js
 */

const discordWebhookPOST = rest.post<undefined, APIMessage>(
  'https://discord.com/api/*/webhooks/*/*',
  (_req, res, ctx) => res(ctx.json({} as any))
);

/**
 * Snapshot Hub
 */

const snapshotHubLegacyTributeProposalGET = rest.get<
  undefined,
  SnapshotHubLegacyTributeProposalEntry
>(
  'http://*/api/*/proposal/*',
  // Just responding with something so the msw doesn't log a warning
  (_req, res, ctx) =>
    res(
      ctx.json({
        body: {
          data: {erc712DraftHash: DEFAULT_EMPTY_BYTES32},
          msg: {
            payload: {
              name: 'Test Proposal',
              body: 'Wow, what a cool submission!',
            },
          },
        },
      })
    )
);

/**
 * HANDLERS TO EXPORT
 */

export const handlers = [
  alchemyAPI,
  discordWebhookPOST,
  snapshotHubLegacyTributeProposalGET,
];
