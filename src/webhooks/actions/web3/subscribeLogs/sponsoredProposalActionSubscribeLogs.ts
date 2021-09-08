import {Log} from 'web3-core/types';

import {EventWeb3Logs} from '../../../events';
import {getDiscordWebhookClient} from '../../../../services/discord';
import {hexToBase16} from '../../../../helpers';

/**
 * Posts to a Discord channel when a DAO Registry's `SponsoredProposal` event is received.
 *
 * @param data `Log` Web3.js subscription log data
 * @returns `(d: Log) => Promise<void>`
 *
 * @see https://web3js.readthedocs.io/en/v1.5.2/web3-eth-subscribe.html#subscribe-logs
 */
export function sponsoredProposalActionSubscribeLogs(
  event: EventWeb3Logs
): (d: Log) => Promise<void> {
  return async (data) => {
    const abi = await event.lazyABI();
    const client = await getDiscordWebhookClient('<webhookID>');

    await client.send({
      content: 'hello!',
      embeds: [
        {
          title: 'A proposal is up for vote',
          description: `Members, go vote! <LINK>`,
          // red alert, or default
          color: hexToBase16('#ff0000') || 'DEFAULT',
        },
      ],
      username: '<NAME> Bot',
    });
  };
}
