// Types

export type SponsoredProposalEmbedTemplateData = Record<
  'proposalURL' | 'txURL',
  string
>;

// Templates

export const SPONSORED_PROPOSAL_TEMPLATE: string = `
**A proposal is up for vote**
`;

export const SPONSORED_PROPOSAL_EMBED_TEMPLATE: string = `
**Vote:** {{proposalURL}}

**View transaction:** {{txURL}}
`;
