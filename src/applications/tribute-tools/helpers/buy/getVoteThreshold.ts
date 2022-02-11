import {TributeToolsCommandsConfiguration} from '../../../../config';

/**
 * Gets a vote threshold given a value.
 *
 * @returns `number`
 */
export function getVoteThreshold({
  amount,
  thresholds,
}: {
  amount: string;
  thresholds:
    | TributeToolsCommandsConfiguration['BUY']['voteThresholds']
    | undefined;
}): number {
  if (!thresholds) return 0;

  const n: number = Number(amount);

  if (isNaN(n)) return 0;

  const thresholdEntry = [...thresholds].find(([[rangeMin, rangeMax]]) => {
    const isGtMinRange: boolean = n > rangeMin;
    // For when `rangeMin` is `0`, so we can include a `0` price
    const isGteMinRange: boolean = n >= rangeMin;
    const isLteMaxRange: boolean = n <= rangeMax;

    if (rangeMin === 0 && isGteMinRange && isLteMaxRange) {
      return true;
    }

    if (rangeMin > 0 && rangeMax === 0 && isGtMinRange) {
      return true;
    }

    if (isGtMinRange && isLteMaxRange) {
      return true;
    }

    // Did not meet any range conditions
    return false;
  });

  return thresholdEntry?.[1] || 0;
}
