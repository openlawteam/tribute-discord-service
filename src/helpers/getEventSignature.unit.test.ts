import {SPONSORED_PROPOSAL_EVENT_SIGNATURE} from '../registry/web3/eventSignatures';
import {getEventSignature} from './getEventSignature';

describe('getEventSignature unit tests', () => {
  test('should return the correct event signature data', () => {
    expect(getEventSignature(SPONSORED_PROPOSAL_EVENT_SIGNATURE)).toEqual({
      signature: SPONSORED_PROPOSAL_EVENT_SIGNATURE,
      signatureHashed:
        '0x5b96711deea669ec50fcc8f3d230291ab4711de1d67a0747e6de4ae6c4263d7c',
    });
  });

  test('should throw if no sha3 could be returned', () => {
    expect(() => getEventSignature('')).toThrow();
  });
});
