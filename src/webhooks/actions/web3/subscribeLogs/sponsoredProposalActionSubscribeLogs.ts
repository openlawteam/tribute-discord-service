import {Log} from 'web3-core/types';

import {
  EventWeb3Logs,
  SPONSORED_PROPOSAL_EVENT_SIGNATURE_HASH,
} from '../../../events';
import {actionErrorHandler} from '../../helpers/actionErrorHandler';
import {getDiscordWebhookClient} from '../../../../services/discord';
import {ETHERSCAN_URL, hexToBase16} from '../../../../helpers';
import {SponsoredProposal} from '../../../../../abi-types/SponsoredProposalEvent';
import {web3} from '../../../../alchemyWeb3Instance';
import {getDaoByRegistryAddress} from '../../../../services/db';

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
  return async (eventData) => {
    try {
      const [abi] = await event.lazyABI();

      if (!abi.inputs || !SPONSORED_PROPOSAL_EVENT_SIGNATURE_HASH) {
        return;
      }

      const {address, data, transactionHash} = eventData;

      const dao = await getDaoByRegistryAddress(address);

      const {proposalId} = web3.eth.abi.decodeLog(abi.inputs, data, [
        SPONSORED_PROPOSAL_EVENT_SIGNATURE_HASH,
      ]) as any as SponsoredProposal['returnValues'];

      const client = await getDiscordWebhookClient('<webhookID>');

      const txURL: string = `${ETHERSCAN_URL}/tx/${transactionHash}`;

      await client.send({
        content: 'hello!',
        embeds: [
          {
            title: 'A proposal is up for vote',
            description: `Members, go vote! <LINK>. View transaction: ${txURL}`,
            // red alert, or default
            color: hexToBase16('#ff0000') || 'DEFAULT',
          },
        ],
        username: '<NAME> Bot',
      });
    } catch (error) {
      if (error instanceof Error) {
        actionErrorHandler({
          actionName: 'sponsoredProposalSubscribeLogs',
          error,
          event,
        });
      }
    }
  };
}
