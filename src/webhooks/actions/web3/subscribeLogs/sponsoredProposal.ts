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
  SPONSORED_PROPOSAL_TEMPLATE,
  SponsoredProposalEmbedTemplateData,
  SponsoredProposalTemplateData,
  SPONSORED_PROPOSAL_FALLBACK_TEMPLATE,
  SPONSORED_PROPOSAL_EMBED_TEMPLATE,
} from '../../../templates';
import {actionErrorHandler} from '../../helpers/actionErrorHandler';
import {DaoData} from '../../../../config/types';
import {getDiscordWebhookClient} from '../../../../services/discord';
import {getProposalAdapterID} from '../../../../services';
import {MessageEmbedOptions, MessageOptions} from 'discord.js';
import {SponsoredProposal} from '../../../../../abi-types/DaoRegistry';
import {web3} from '../../../../alchemyWeb3Instance';

type DiscordMessageEmbeds = MessageOptions['embeds'];

const EMPTY_EMBED: MessageEmbedOptions[] = [];

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

      if (
        !dao ||
        !dao.snapshotHub ||
        !daoAction?.webhookID ||
        !isDaoActionActive(daoAction) ||
        !SPONSORED_PROPOSAL_EVENT_SIGNATURE_HASH
      ) {
        return;
      }

      const abi = await event.lazyABI();

      const sponsoredProposalEventInputs = abi.find(
        ({name, type}) => type === 'event' && name === 'SponsoredProposal'
      )?.inputs;

      if (!sponsoredProposalEventInputs) {
        return;
      }

      const {
        adapters,
        baseURL,
        friendlyName,
        registryContractAddress,
        snapshotHub: {
          proposalResolver: snapshotProposalResolver,
          space: snapshotSpace,
        },
      } = dao;

      const {data, transactionHash} = eventData;

      const {proposalId} = web3.eth.abi.decodeLog(
        sponsoredProposalEventInputs,
        data,
        [SPONSORED_PROPOSAL_EVENT_SIGNATURE_HASH]
      ) as any as SponsoredProposal['returnValues'];

      const client = await getDiscordWebhookClient(daoAction.webhookID);

      const adapterID = await getProposalAdapterID(
        proposalId,
        registryContractAddress
      );

      const proposalURL: string = `${baseURL}/${adapters?.[adapterID].baseURLPath}/${proposalId}`;
      const txURL: string = `${getEtherscanURL()}/tx/${transactionHash}`;

      const proposal = await snapshotProposalResolver(
        proposalId,
        snapshotSpace
      );

      const content: string =
        compileSimpleTemplate<SponsoredProposalTemplateData>(
          proposal
            ? SPONSORED_PROPOSAL_TEMPLATE
            : SPONSORED_PROPOSAL_FALLBACK_TEMPLATE,
          proposal
            ? {title: proposal.title, proposalURL, txURL}
            : {proposalURL, txURL}
        );

      const embedDescription: string =
        compileSimpleTemplate<SponsoredProposalEmbedTemplateData>(
          SPONSORED_PROPOSAL_EMBED_TEMPLATE,
          {body: proposal?.body}
        );

      // Falls back to empty embed if no proposal
      const embedBody: DiscordMessageEmbeds = proposal
        ? [
            {
              color: 'DEFAULT',
              description: embedDescription,
            },
          ]
        : EMPTY_EMBED;

      // Merge any embeds
      const embeds: DiscordMessageEmbeds = [...embedBody];

      await client.send({
        content,
        // @see https://discord.com/developers/docs/resources/channel#embed-object-embed-structure
        embeds,
        username: `${friendlyName}`,
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
