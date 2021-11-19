import {FAKE_DAOS_FIXTURE} from '../../test/fixtures';
import {getDaoDataBySnapshotSpace} from './getDaoDataBySnapshotSpace';

describe('getDaoDataBySnapshotSpace unit tests', () => {
  test("should return a dao's data", async () => {
    expect(getDaoDataBySnapshotSpace('tribute', FAKE_DAOS_FIXTURE)).toEqual(
      FAKE_DAOS_FIXTURE.test
    );
  });

  test('should return `undefined`', async () => {
    expect(getDaoDataBySnapshotSpace('badbadbad', FAKE_DAOS_FIXTURE)).toEqual(
      undefined
    );
  });
});
