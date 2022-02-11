import {getVoteThreshold} from './getVoteThreshold';

describe('getVoteThreshold unit tests', () => {
  const VOTE_THRESHOLDS: Map<[number, number], number> = new Map([
    [[0, 15], 3],
    [[15, 30], 5],
    [[30, 100], 10],
    [[100, 0], 20],
  ]);

  test('should return threshold when within range: > min, <= max', () => {
    expect(getVoteThreshold({amount: '0.5', thresholds: VOTE_THRESHOLDS})).toBe(
      3
    );

    expect(getVoteThreshold({amount: '15', thresholds: VOTE_THRESHOLDS})).toBe(
      3
    );

    expect(
      getVoteThreshold({amount: '15.1', thresholds: VOTE_THRESHOLDS})
    ).toBe(5);

    expect(getVoteThreshold({amount: '30', thresholds: VOTE_THRESHOLDS})).toBe(
      5
    );

    expect(getVoteThreshold({amount: '35', thresholds: VOTE_THRESHOLDS})).toBe(
      10
    );

    expect(getVoteThreshold({amount: '100', thresholds: VOTE_THRESHOLDS})).toBe(
      10
    );

    expect(
      getVoteThreshold({amount: '100.1', thresholds: VOTE_THRESHOLDS})
    ).toBe(20);

    expect(getVoteThreshold({amount: '500', thresholds: VOTE_THRESHOLDS})).toBe(
      20
    );
  });

  test('should return threshold when price is `0` and `amount` >= min, <= max', () => {
    expect(getVoteThreshold({amount: '0', thresholds: VOTE_THRESHOLDS})).toBe(
      3
    );
  });

  test('should return threshold when max range is `0`, min range > `0`, and `amount` > min', () => {
    expect(getVoteThreshold({amount: '200', thresholds: VOTE_THRESHOLDS})).toBe(
      20
    );
  });

  test('should return `0` if no thresholds', () => {
    expect(getVoteThreshold({amount: '200', thresholds: undefined})).toBe(0);
  });

  test('should return `0` if amount evaluates to `NaN`', () => {
    expect(
      getVoteThreshold({amount: '200BAD', thresholds: VOTE_THRESHOLDS})
    ).toBe(0);
  });

  test('should return `0` if no threshold conditions are met', () => {
    const VOTE_THRESHOLDS: Map<[number, number], number> = new Map([
      [[0, 15], 3],
      [[15, 30], 5],
      [[30, 100], 10],
    ]);

    expect(getVoteThreshold({amount: '200', thresholds: VOTE_THRESHOLDS})).toBe(
      0
    );
  });
});
