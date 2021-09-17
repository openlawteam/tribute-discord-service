// Types

export type SponsoredProposalTemplateData = {
  proposalURL?: string;
  title?: string;
  txURL?: string;
};

export type SponsoredProposalEmbedTemplateData = {
  body?: string;
};

// Templates

/**
 * Partial template for sharing links between templates
 */
const PROPOSAL_LINKS_PARTIAL: string = `[Vote]({{proposalURL}})  |  [View transaction]({{txURL}})`;

/**
 * Main content for a sponsored proposal
 */
export const SPONSORED_PROPOSAL_TEMPLATE: string = `
*{{title}}* is up for vote.

${PROPOSAL_LINKS_PARTIAL}`;

/**
 * Fallback template in case the Snapshot Hub proposal
 * cannot be fetched for some reason.
 */
export const SPONSORED_PROPOSAL_FALLBACK_TEMPLATE: string = `
A proposal is up for vote.

${PROPOSAL_LINKS_PARTIAL}`;

/**
 * Template for an embed of the body of the Snapshot Hub proposal
 */
export const SPONSORED_PROPOSAL_EMBED_TEMPLATE: string = `
{{body}}`;
