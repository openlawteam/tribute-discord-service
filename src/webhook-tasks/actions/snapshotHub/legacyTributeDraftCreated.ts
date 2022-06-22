import {
  getDaoDataBySnapshotSpace,
  getDiscordAction,
  isDebug,
  isDiscordActionOrEventActive,
} from '../../../helpers';
import {
  compileSimpleTemplate,
  SNAPSHOT_DRAFT_CREATED_EMBED_TEMPLATE,
  SNAPSHOT_DRAFT_CREATED_TEMPLATE,
  SnapshotDraftCreatedEmbedTemplateData,
  SnapshotDraftCreatedTemplateData,
} from '../../templates';
import {
  SnapshotHubLegacyTributeDraft,
  SnapshotHubMessageType,
} from '../../../services/snapshotHub';
import {actionErrorHandler} from '../helpers/actionErrorHandler';
import {DaoDiscordConfig} from '../../../config/types';
import {DiscordMessageEmbeds} from '..';
import {getDiscordWebhookClient} from '../../../services/discord';
import {getProposalAdapterID} from '../../../services';
import {SNAPSHOT_PROPOSAL_CREATED_EVENT} from '../../events/snapshotHub';
import {SnapshotHubEventPayload} from './types';
import {takeSnapshotProposalID} from './helpers';

/**
 * Posts to a Discord channel when a legacy Tribute
 * draft is created on a Snapshot Hub.
 *
 * @param event `EventSnapshotProposalWebhook`
 * @param daos `Record<string, DaoDiscordConfig> | undefined` Web3.js subscription log data
 *
 * @returns `(d: SnapshotHubEventPayload) => Promise<void>`
 */
export function legacyTributeDraftCreatedAction(
  event: typeof SNAPSHOT_PROPOSAL_CREATED_EVENT,
  daos: Record<string, DaoDiscordConfig> | undefined
): (s: SnapshotHubEventPayload) => Promise<void> {
  return async (snapshotEvent) => {
    try {
      if (!snapshotEvent || snapshotEvent.event !== event.snapshotEventName) {
        return;
      }

      const {space} = snapshotEvent;
      const dao = getDaoDataBySnapshotSpace(space, daos);
      const daoAction = getDiscordAction('SNAPSHOT_DRAFT_CREATED_WEBHOOK', dao);

      if (
        !dao ||
        !dao.snapshotHub ||
        !daoAction?.webhookID ||
        !isDiscordActionOrEventActive(daoAction)
      ) {
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

      const draftID: string = takeSnapshotProposalID(snapshotEvent.id);

      const draft =
        await snapshotProposalResolver<SnapshotHubLegacyTributeDraft>({
          proposalID: draftID,
          resolver: 'LEGACY_TRIBUTE_DRAFT',
          space: snapshotSpace,
        });

      // Exit if no draft
      if (!draft) return;

      const {raw: draftRaw} = draft;

      // Exit if not draft
      if (draftRaw.msg.type !== SnapshotHubMessageType.DRAFT) {
        return;
      }

      const adapterID = await getProposalAdapterID({
        adapterAddress: draftRaw.actionId,
        daoAddress: registryContractAddress,
      });

      // Exit if no `adapterID`
      if (!adapterID) {
        return;
      }

      const draftURL: string = `${baseURL}/${
        adapters?.[adapterID || '']?.baseURLPath
      }/${draftID}`;

      const createdDateUTCString = new Date(
        (Number(draftRaw.msg.timestamp) || 0) * 1000
      ).toUTCString();

      const content: string =
        compileSimpleTemplate<SnapshotDraftCreatedTemplateData>(
          SNAPSHOT_DRAFT_CREATED_TEMPLATE,
          {
            createdDateUTCString,
            draftURL,
            title: draft.title,
          }
        );

      // Falls back to empty embed if no proposal
      const embedBody: DiscordMessageEmbeds = [
        {
          color: 'DEFAULT',
          description:
            compileSimpleTemplate<SnapshotDraftCreatedEmbedTemplateData>(
              SNAPSHOT_DRAFT_CREATED_EMBED_TEMPLATE,
              {body: draft?.body}
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
          actionName: 'SNAPSHOT_DRAFT_CREATED_WEBHOOK',
          error,
          event,
        });
      }
    }
  };
}
