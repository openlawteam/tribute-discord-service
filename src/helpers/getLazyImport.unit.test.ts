import {getLazyImport} from './getLazyImport';
import ABI from '../abis/tribute/DaoRegistrySponsoredProposalEvent.json';

describe('getLazyImport unit tests', () => {
  test('should return imported ABI JSON', async () => {
    expect(
      await getLazyImport(
        () => import('../abis/tribute/DaoRegistrySponsoredProposalEvent.json')
      )()
    ).toStrictEqual(ABI as any);
  });
});
