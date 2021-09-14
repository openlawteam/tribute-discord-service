import {rest} from './server';

/**
 * Alchemy API
 */

const alchemyAPI = rest.get(
  'https://eth-*.alchemyapi.io/v2/*',
  // Just responding with something so the msw doesn't log a warning
  (_req, res, ctx) => res(ctx.status(200))
);

/**
 * HANDLERS TO EXPORT
 */

export const handlers = [alchemyAPI];
