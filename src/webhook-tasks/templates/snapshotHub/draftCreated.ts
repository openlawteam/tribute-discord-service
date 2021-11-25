// Types

export type SnapshotDraftCreatedTemplateData = {
  draftURL?: string;
  title?: string;
  createdDateUTCString?: string;
};

export type SnapshotDraftCreatedEmbedTemplateData = {
  body?: string;
};

// Templates

/**
 * Main content for a created draft
 */
export const SNAPSHOT_DRAFT_CREATED_TEMPLATE: string = `
 A new proposal, [*{{title}}*]({{draftURL}}), has been submitted on {{createdDateUTCString}}.`;

/**
 * Template for an embed of the body of the Snapshot Hub draft
 */
export const SNAPSHOT_DRAFT_CREATED_EMBED_TEMPLATE: string = `
{{body}}`;
