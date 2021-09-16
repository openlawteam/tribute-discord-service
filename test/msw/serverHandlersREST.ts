import {APIMessage} from 'discord-api-types';

import {LEGACY_TRIBUTE_SNAPSHOT_HUB_PROPOSAL_FIXTURE} from '..';
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
>('http://*/api/*/proposal/*', (_req, res, ctx) =>
  res(ctx.json(LEGACY_TRIBUTE_SNAPSHOT_HUB_PROPOSAL_FIXTURE))
);

/**
 * HANDLERS TO EXPORT
 */

export const handlers = [
  alchemyAPI,
  discordWebhookPOST,
  snapshotHubLegacyTributeProposalGET,
];
