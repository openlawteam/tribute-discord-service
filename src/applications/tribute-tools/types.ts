export type PollOptionLetters =
  | 'a'
  | 'b'
  | 'c'
  | 'd'
  | 'e'
  | 'f'
  | 'g'
  | 'h'
  | 'i'
  | 'j';

// e.g. { "🇦": 50, "🚫": "None" }
export type PollEmojiOptions = Record<string, number | 'None'>;
