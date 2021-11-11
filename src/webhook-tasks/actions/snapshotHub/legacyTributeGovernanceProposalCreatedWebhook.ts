import {
  BURN_ADDRESS,
  DISCORD_EMPTY_EMBED,
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
import {DiscordMessageEmbeds} from '..';
import {EventSnapshotProposalWebhook} from '../../events/snapshotHub';
import {getDiscordWebhookClient} from '../../../services/discord';
import {SnapshotHubEventPayload} from './types';
import {SnapshotHubLegacyTributeProposal} from '../../../services/snapshotHub';
import {takeSnapshotProposalID} from './helpers';

/**
 * Posts to a Discord channel when a proposal is created on a Snapshot Hub.
 *
 * @param data `Log` Web3.js subscription log data
 * @returns `(d: Log) => Promise<void>`
 *
 * @see https://web3js.readthedocs.io/en/v1.5.2/web3-eth-subscribe.html#subscribe-logs
 */
export function legacyTributeGovernanceProposalCreatedWebhookAction(
  event: EventSnapshotProposalWebhook,
  daos: Record<string, DaoData> | undefined
): (s: SnapshotHubEventPayload) => Promise<void> {
  return async (snapshotEvent) => {
    try {
      if (!snapshotEvent || snapshotEvent.event !== event.snapshotEventName) {
        return;
      }

      const {space} = snapshotEvent;

      const dao = getDaoDataBySnapshotSpace(space, daos);
      const daoAction = getDaoAction('SNAPSHOT_PROPOSAL_CREATED_WEBHOOK', dao);

      if (
        !dao ||
        !dao.snapshotHub ||
        !daoAction?.webhookID ||
        !isDaoActionActive(daoAction) ||
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
        await snapshotProposalResolver<SnapshotHubLegacyTributeProposal>({
          proposalID,
          queryString: '?searchUniqueDraftId=true',
          resolver: 'LEGACY_TRIBUTE',
          space: snapshotSpace,
        });

      const proposalRaw = proposal?.raw;

      // Exit if not governance
      if (
        !proposalRaw?.actionId ||
        normalizeString(proposalRaw?.actionId) === normalizeString(BURN_ADDRESS)
      ) {
        return;
      }

      const proposalURL: string = `${baseURL}/${
        adapters?.[proposalRaw?.actionId].baseURLPath
      }/${proposalID}`;

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
        : DISCORD_EMPTY_EMBED;

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
