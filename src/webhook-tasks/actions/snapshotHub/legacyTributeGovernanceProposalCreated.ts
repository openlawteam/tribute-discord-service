import {
  BURN_ADDRESS,
  getDaoAction,
  getDaoDataBySnapshotSpace,
  isDaoActionActive,
  isDebug,
  normalizeString,
} from '../../../helpers';
import {
  compileSimpleTemplate,
  SNAPSHOT_GOVERNANCE_PROPOSAL_CREATED_TEMPLATE,
  SNAPSHOT_PROPOSAL_CREATED_EMBED_TEMPLATE,
  SnapshotProposalCreatedEmbedTemplateData,
  SnapshotProposalCreatedTemplateData,
} from '../../templates';
import {
  SnapshotHubLegacyTributeProposal,
  SnapshotHubMessageType,
} from '../../../services/snapshotHub';
import {actionErrorHandler} from '../helpers/actionErrorHandler';
import {DaoData} from '../../../config/types';
import {DiscordMessageEmbeds} from '..';
import {EventSnapshotProposalWebhook} from '../../events/snapshotHub';
import {getDiscordWebhookClient} from '../../../services/discord';
import {SnapshotHubEventPayload} from './types';
import {takeSnapshotProposalID} from './helpers';

/**
 * Posts to a Discord channel when a legacy Tribute
 * governance proposal is created on a Snapshot Hub.
 *
 * @param event `EventSnapshotProposalWebhook`
 * @param daos `Record<string, DaoData> | undefined` Web3.js subscription log data
 *
 * @returns `(d: SnapshotHubEventPayload) => Promise<void>`
 */
export function legacyTributeGovernanceProposalCreatedAction(
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
        !isDaoActionActive(daoAction)
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

      // Exit if no proposal
      if (!proposal) return;

      const {raw: proposalRaw} = proposal;

      // Exit if type is not `SnapshotHubMessageType.PROPOSAL`
      if (proposalRaw.msg.type !== SnapshotHubMessageType.PROPOSAL) {
        return;
      }

      // Exit if fetched proposal is not governance
      if (
        normalizeString(proposalRaw.actionId) !== normalizeString(BURN_ADDRESS)
      ) {
        return;
      }

      const proposalURL: string = `${baseURL}/${
        adapters?.[proposalRaw.actionId]?.baseURLPath
      }/${proposalID}`;

      const voteEndsDateUTCString = new Date(
        (proposalRaw.msg.payload.end || 0) * 1000
      ).toUTCString();

      const content: string =
        compileSimpleTemplate<SnapshotProposalCreatedTemplateData>(
          SNAPSHOT_GOVERNANCE_PROPOSAL_CREATED_TEMPLATE,
          {
            title: proposal.title,
            proposalURL,
            voteEndsDateUTCString,
          }
        );

      // Falls back to empty embed if no proposal
      const embedBody: DiscordMessageEmbeds = [
        {
          color: 'DEFAULT',
          description:
            compileSimpleTemplate<SnapshotProposalCreatedEmbedTemplateData>(
              SNAPSHOT_PROPOSAL_CREATED_EMBED_TEMPLATE,
              {body: proposal?.body}
            ),
        },
      ];
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
