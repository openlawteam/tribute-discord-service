import {takeSnapshotProposalID} from './takeSnapshotProposalID';

describe('takeSnapshotProposalID unit tests', () => {
  test('should return only the ID', () => {
    const ID: string = 'abc123';

    expect(takeSnapshotProposalID(`proposal/${ID}`)).toBe(ID);
  });

  test('should return blank string if no ID', () => {
    const ID: string = '';

    expect(takeSnapshotProposalID(`proposal/${ID}`)).toBe(ID);
  });

  test('should return original string if bad format', () => {
    const BAD: string = `prop`;

    expect(takeSnapshotProposalID(BAD as any)).toBe(BAD);
  });
});
