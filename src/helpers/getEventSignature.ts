import {sha3} from 'web3-utils';

export type EventSignature = {
  /**
   * Readable Event signature
   *
   * E.g. `SponsoredProposal(bytes32,uint256,address)`
   */
  signature: string;
  /**
   * keccak256 hash of the Event signature
   *
   * E.g. `sha3('SponsoredProposal(bytes32,uint256,address)')`
   */
  signatureHashed: string;
};

/**
 * getEventSignature
 *
 * A helper to safely get a parsed Event signature.
 *
 * @param readableEventSignature `string` - Remember, the event signature should not have spaces
 *   before or after a comma if the arguments are a list.
 *
 *   E.g. Correct: `'SponsoredProposal(bytes32,uint256,address)'`.
 * @returns `EventSignature` or throws an `Error`.
 */
export function getEventSignature(
  readableEventSignature: string
): EventSignature {
  const signatureHashed = sha3(readableEventSignature);

  if (!signatureHashed) {
    throw new Error(`No sha3 hash of ${readableEventSignature} was returned.`);
  }

  return {
    signature: readableEventSignature,
    signatureHashed,
  };
}
