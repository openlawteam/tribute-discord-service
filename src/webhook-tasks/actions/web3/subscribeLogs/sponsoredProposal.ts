import {Log} from 'web3-core/types';

import {
  EventWeb3Logs,
  SPONSORED_PROPOSAL_EVENT_SIGNATURE_HASH,
} from '../../../events';
import {
  DISCORD_EMPTY_EMBED,
  getDiscordAction,
  getDaoDataByAddress,
  getEtherscanURL,
  isDiscordActionOrEventActive,
  isDebug,
} from '../../../../helpers';
import {
  compileSimpleTemplate,
  SPONSORED_PROPOSAL_EMBED_TEMPLATE,
  SPONSORED_PROPOSAL_FALLBACK_TEMPLATE,
  SPONSORED_PROPOSAL_TEMPLATE,
  SponsoredProposalEmbedTemplateData,
  SponsoredProposalTemplateData,
} from '../../../templates';
import {actionErrorHandler} from '../../helpers/actionErrorHandler';
import {DaoDiscordConfig} from '../../../../config/types';
import {DiscordMessageEmbeds} from '../..';
import {getDiscordWebhookClient} from '../../../../services/discord';
import {getProposalAdapterID} from '../../../../services';
import {SponsoredProposal} from '../../../../../abi-types/DaoRegistry';
import {web3} from '../../../../singletons';

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
  daos: Record<string, DaoDiscordConfig> | undefined
): (d: Log) => Promise<void> {
  return async (eventData) => {
    try {
      if (!eventData) return;

      const dao = getDaoDataByAddress(eventData.address, daos);
      const daoAction = getDiscordAction('SPONSORED_PROPOSAL_WEBHOOK', dao);

      if (
        !dao ||
        !dao.snapshotHub ||
        !daoAction?.webhookID ||
        !isDiscordActionOrEventActive(daoAction) ||
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

      const adapterID = await getProposalAdapterID({
        proposalID: proposalId,
        daoAddress: registryContractAddress,
      });

      // Exit if no `adapterID`
      if (!adapterID) {
        return;
      }

      const proposalURL: string = `${baseURL}/${
        adapters?.[adapterID || ''].baseURLPath
      }/${proposalId}`;

      const txURL: string = `${getEtherscanURL()}/tx/${transactionHash}`;

      const proposal = await snapshotProposalResolver({
        proposalID: proposalId,
        queryString: '?searchUniqueDraftId=true',
        space: snapshotSpace,
      });

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
        : DISCORD_EMPTY_EMBED;

      // Merge any embeds
      const embeds: DiscordMessageEmbeds = [...embedBody];

      const response = await client.send({
        content,
        // @see https://discord.com/developers/docs/resources/channel#embed-object-embed-structure
        embeds,
        username: `${friendlyName}`,
      });

      if (isDebug()) {
        console.debug(
          `Sent Discord message after ${event.name} event for ${
            dao.friendlyName
          }. Response:\n${JSON.stringify(response, null, 2)}`
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        actionErrorHandler({
          actionName: 'SPONSORED_PROPOSAL_WEBHOOK',
          error,
          event,
        });
      }
    }
  };
}
