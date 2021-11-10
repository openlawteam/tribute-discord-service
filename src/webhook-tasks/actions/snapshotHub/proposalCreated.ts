import {
  getDaoAction,
  getDaoDataBySnapshotSpace,
  isDaoActionActive,
  isDebug,
  normalizeString,
} from '../../../helpers';
import {
  compileSimpleTemplate,
  SPONSORED_PROPOSAL_EMBED_TEMPLATE,
  SPONSORED_PROPOSAL_FALLBACK_TEMPLATE,
  SPONSORED_PROPOSAL_TEMPLATE,
  SponsoredProposalEmbedTemplateData,
  SponsoredProposalTemplateData,
} from '../../templates';
import {actionErrorHandler} from '../helpers/actionErrorHandler';
import {DaoData} from '../../../config/types';
import {EventSnapshotProposalWebhook} from '../../events/snapshotHub';
import {getDiscordWebhookClient} from '../../../services/discord';
import {MessageEmbedOptions, MessageOptions} from 'discord.js';
import {SnapshotHubEventPayload, SnapshotHubEvents} from './types';
import {takeSnapshotProposalID} from './helpers';
import {getProposalAdapterID} from '../../../services';
import {SnapshotHubProposalBase} from '../../../services/snapshotHub';

type DiscordMessageEmbeds = MessageOptions['embeds'];

interface LegacyTributeSnapshotHubProposal extends SnapshotHubProposalBase {
  /**
   * ETH address of the adapter
   *
   * (e.g. 0x0000000... for governance)
   */
  actionId: string;
}

const EMPTY_EMBED: MessageEmbedOptions[] = [];

const GOVERNANCE_ACTION_ID: string =
  '0x0000000000000000000000000000000000000000';

/**
 * Posts to a Discord channel when a proposal is created on a Snapshot Hub.
 *
 * @param data `Log` Web3.js subscription log data
 * @returns `(d: Log) => Promise<void>`
 *
 * @see https://web3js.readthedocs.io/en/v1.5.2/web3-eth-subscribe.html#subscribe-logs
 */
export function snapshotProposalCreatedWebhookAction(
  event: EventSnapshotProposalWebhook,
  daos: Record<string, DaoData> | undefined
): (s: SnapshotHubEventPayload) => Promise<void> {
  return async (snapshotEvent) => {
    try {
      if (!snapshotEvent) return;

      const {event: snapshotEventName, space} = snapshotEvent;

      const dao = getDaoDataBySnapshotSpace(space, daos);
      const daoAction = getDaoAction('SNAPSHOT_PROPOSAL_CREATED_WEBHOOK', dao);

      if (
        !dao ||
        !dao.snapshotHub ||
        !daoAction?.webhookID ||
        !isDaoActionActive(daoAction) ||
        snapshotEventName !== event.snapshotEventName ||
        space !== dao.snapshotHub.space
      ) {
        return;
      }

      const {
        adapters,
        baseURL,
        friendlyName,
        snapshotHub: {
          proposalResolver: snapshotProposalResolver,
          space: snapshotSpace,
        },
      } = dao;

      const proposalID: string = takeSnapshotProposalID(snapshotEvent.id);

      const proposal =
        await snapshotProposalResolver<LegacyTributeSnapshotHubProposal>({
          proposalID,
          queryString: '?searchUniqueDraftId=true',
          space: snapshotSpace,
        });

      // Exit if not governance
      if (
        normalizeString(proposal?.actionId) ===
        normalizeString(GOVERNANCE_ACTION_ID)
      ) {
        return;
      }

      const adapterID = 123;

      const proposalURL: string = `${baseURL}/${adapters?.[adapterID].baseURLPath}/${proposalID}`;

      const content: string =
        compileSimpleTemplate<SponsoredProposalTemplateData>(
          proposal
            ? SPONSORED_PROPOSAL_TEMPLATE
            : SPONSORED_PROPOSAL_FALLBACK_TEMPLATE,
          proposal ? {title: proposal.title, proposalURL} : {proposalURL}
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

      const client = await getDiscordWebhookClient(daoAction.webhookID);

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
          actionName: 'SNAPSHOT_PROPOSAL_CREATED_WEBHOOK',
          error,
          event,
        });
      }
    }
  };
}
