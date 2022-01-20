import {PollOptionLetters} from './types';

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

export const SWEEP_EXTERNAL_URL: string = 'https://tributelabs.xyz/';
