import {Log} from 'web3-core/types';

import {
  EventWeb3Logs,
  SPONSORED_PROPOSAL_EVENT_SIGNATURE_HASH,
} from '../../../events';
import {
  getDaoAction,
  getDAODataByAddress,
  getEtherscanURL,
  isDaoActionActive,
} from '../../../../helpers';
import {
  compileSimpleTemplate,
  SponsoredProposalEmbedTemplateData,
  SPONSORED_PROPOSAL_TEMPLATE,
  SPONSORED_PROPOSAL_EMBED_TEMPLATE,
} from '../../../templates';
import {actionErrorHandler} from '../../helpers/actionErrorHandler';
import {DaoData} from '../../../../config/types';
import {getDiscordWebhookClient} from '../../../../services/discord';
import {getProposalAdapterID} from '../../../../services';
import {SponsoredProposal} from '../../../../../abi-types/DaoRegistry';
import {web3} from '../../../../alchemyWeb3Instance';

/**
 * Posts to a Discord channel when a DAO Registry's `SponsoredProposal` event is received.
 *
 * @param data `Log` Web3.js subscription log data
 * @returns `(d: Log) => Promise<void>`
 *
 * @see https://web3js.readthedocs.io/en/v1.5.2/web3-eth-subscribe.html#subscribe-logs
 */
export function sponsoredProposalActionSubscribeLogs(
  event: EventWeb3Logs,
  daos: Record<string, DaoData> | undefined
): (d: Log) => Promise<void> {
  return async (eventData) => {
    try {
      const dao = getDAODataByAddress(eventData.address, daos);
      const daoAction = getDaoAction('SPONSORED_PROPOSAL_WEBHOOK', dao);

      if (!dao || !isDaoActionActive(daoAction) || !daoAction?.webhookID) {
        return;
      }

      const abi = await event.lazyABI();

      const sponsoredProposalEventInputs = abi.find(
        ({name, type}) => type === 'event' && name === 'SponsoredProposal'
      )?.inputs;

      if (
        !SPONSORED_PROPOSAL_EVENT_SIGNATURE_HASH ||
        !sponsoredProposalEventInputs
      ) {
        return;
      }

      const {data, transactionHash} = eventData;

      const {proposalId} = web3.eth.abi.decodeLog(
        sponsoredProposalEventInputs,
        data,
        [SPONSORED_PROPOSAL_EVENT_SIGNATURE_HASH]
      ) as any as SponsoredProposal['returnValues'];

      const client = await getDiscordWebhookClient(daoAction.webhookID);

      const adapterID = await getProposalAdapterID(
        proposalId,
        dao.registryContractAddress
      );

      const proposalURL: string = `${dao.baseURL}/${dao.adapters?.[adapterID].baseURLPath}/${proposalId}`;
      const txURL: string = `${getEtherscanURL()}/tx/${transactionHash}`;

      await client.send({
        content: compileSimpleTemplate(SPONSORED_PROPOSAL_TEMPLATE),
        // @see https://discord.com/developers/docs/resources/channel#embed-object-embed-structure
        embeds: [
          {
            color: 'DEFAULT',
            description:
              compileSimpleTemplate<SponsoredProposalEmbedTemplateData>(
                SPONSORED_PROPOSAL_EMBED_TEMPLATE,
                {proposalURL, txURL}
              ),
          },
        ],
        username: `${dao.friendlyName}`,
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
