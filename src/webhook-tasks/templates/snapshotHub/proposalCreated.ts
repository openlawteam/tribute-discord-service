// Types

export type SnapshotProposalCreatedTemplateData = {
  proposalURL?: string;
  title?: string;
  voteEndsDateUTCString?: string;
};

export type SnapshotProposalCreatedEmbedTemplateData = {
  body?: string;
};

// Templates

/**
 * Main content for a created proposal
 */
export const SNAPSHOT_PROPOSAL_CREATED_TEMPLATE: string = `
*{{title}}* is up for [vote]({{proposalURL}}). Voting ends {{voteEndsDateUTCString}}`;

/**
 * Governance proposal
 */
export const SNAPSHOT_GOVERNANCE_PROPOSAL_CREATED_TEMPLATE: string = `
Governance ⚖️
${SNAPSHOT_PROPOSAL_CREATED_TEMPLATE}`;

/**
 * Template for an embed of the body of the Snapshot Hub proposal
 */
export const SNAPSHOT_PROPOSAL_CREATED_EMBED_TEMPLATE: string = `
{{body}}`;
