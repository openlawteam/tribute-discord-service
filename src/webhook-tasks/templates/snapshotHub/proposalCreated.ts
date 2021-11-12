// Types

export type SnapshotProposalCreatedTemplateData = {
  proposalURL?: string;
  title?: string;
  voteEndsDateLocaleString?: string;
};

export type SnapshotProposalCreatedFallbackTemplateData = {
  baseURL?: string;
  friendlyName?: string;
};

export type SnapshotProposalCreatedEmbedTemplateData = {
  body?: string;
};

// Templates

/**
 * Main content for a created proposal
 */
export const SNAPSHOT_PROPOSAL_CREATED_TEMPLATE: string = `
*{{title}}* is up for vote.

[Vote]({{proposalURL}})`;

/**
 * Governance proposal
 */
export const SNAPSHOT_GOVERNANCE_PROPOSAL_CREATED_TEMPLATE: string = `
Governance ⚖️: ${SNAPSHOT_PROPOSAL_CREATED_TEMPLATE}`;

/**
 * Fallback template in case the Snapshot Hub proposal
 * cannot be fetched for some reason.
 */
export const SNAPSHOT_PROPOSAL_CREATED_FALLBACK_TEMPLATE: string = `
A proposal is up for vote (proposal data could not be fetched).

Find it at [{{friendlyName}}]({{baseURL}}).

`;

/**
 * Template for an embed of the body of the Snapshot Hub proposal
 */
export const SNAPSHOT_PROPOSAL_CREATED_EMBED_TEMPLATE: string = `
{{body}}`;
