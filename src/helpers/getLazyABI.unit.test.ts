import {getLazyABI} from './getLazyABI';
import ABI from '../abis/SponsoredProposalEvent.json';

describe('getLazyABI unit tests', () => {
  test('should return imported ABI JSON', async () => {
    expect(
      await getLazyABI('../abis/SponsoredProposalEvent.json')()
    ).toStrictEqual(ABI as any);
  });
});
