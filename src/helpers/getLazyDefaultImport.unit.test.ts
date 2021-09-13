import {getLazyDefaultImport} from './getLazyDefaultImport';
import ABI from '../abis/tribute/DaoRegistry.json';

describe('getLazyImport unit tests', () => {
  test('should return imported ABI JSON', async () => {
    expect(
      await getLazyDefaultImport(
        () => import('../abis/tribute/DaoRegistry.json')
      )()
    ).toStrictEqual(ABI as any);
  });
});
