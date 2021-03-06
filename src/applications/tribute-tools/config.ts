import {APP_ENV, TRIBUTE_TOOLS_BOT_ID} from '../../config';
import {PollOptionLetters} from './types';

/**
 * `/sweep` Command Config
 */

// For getting the `regional_indicator_<x>` emojis
export const REGIONAL_INDICATOR_PREFIX: 'regional_indicator_' =
  'regional_indicator_';

export const NO_ENTRY_SIGN_EMOJI: 'no_entry_sign' = 'no_entry_sign';

export const POLL_REACTION_EMOJIS: Record<
  | `${typeof REGIONAL_INDICATOR_PREFIX}${PollOptionLetters}`
  | typeof NO_ENTRY_SIGN_EMOJI,
  string
> = {
  regional_indicator_a: '🇦',
  regional_indicator_b: '🇧',
  regional_indicator_c: '🇨',
  regional_indicator_d: '🇩',
  regional_indicator_e: '🇪',
  regional_indicator_f: '🇫',
  regional_indicator_g: '🇬',
  regional_indicator_h: '🇭',
  regional_indicator_i: '🇮',
  regional_indicator_j: '🇯',
  no_entry_sign: '🚫',
};

export const TRIBUTE_TOOLS_URL: string =
  APP_ENV === 'production'
    ? 'https://tools.tributelabs.xyz'
    : 'https://tools.dev.tributelabs.xyz';

export const BUY_EXTERNAL_URL: string = `${TRIBUTE_TOOLS_URL}/single-buy`;
export const FUND_EXTERNAL_URL: string = `${TRIBUTE_TOOLS_URL}/fund`;
export const SWEEP_EXTERNAL_URL: string = `${TRIBUTE_TOOLS_URL}/floor-sweeper`;
export const THUMBS_EMOJIS = ['👍', '👎'] as const;
export const CANCEL_POLL_BUY_CUSTOM_ID: string = 'cancelBuyPoll';
export const CANCEL_POLL_FUND_CUSTOM_ID: string = 'cancelFundPoll';
export const CANCEL_POLL_SWEEP_CUSTOM_ID: string = 'cancelSweepPoll';
