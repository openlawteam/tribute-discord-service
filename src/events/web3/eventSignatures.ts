import {sha3} from 'web3-utils';

/**
 * Web3 event signature constants
 */

// @see `abis/SponsoredProposalEvent.json`
export const SPONSORED_PROPOSAL_EVENT_SIGNATURE: string =
  'SponsoredProposal(bytes32,uint256,address)';

export const SPONSORED_PROPOSAL_EVENT_SIGNATURE_HASH: string | null = sha3(
  SPONSORED_PROPOSAL_EVENT_SIGNATURE
);
