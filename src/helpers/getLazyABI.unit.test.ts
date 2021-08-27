import {getLazyABI} from './getLazyABI';
import ABI from '../abis/tribute/DaoRegistrySponsoredProposalEvent.json';

describe('getLazyABI unit tests', () => {
  test('should return imported ABI JSON', async () => {
    expect(
      await getLazyABI(
        '../abis/tribute/DaoRegistrySponsoredProposalEvent.json'
      )()
    ).toStrictEqual(ABI as any);
  });
});
