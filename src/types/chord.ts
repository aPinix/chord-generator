export interface ChordData {
  strings: string;
  fingering: string;
  chordName: string;
}

export interface VexChordBarre {
  fromString: number;
  toString: number;
  fret: number;
}

export interface FretPosition {
  string: number;
  fret: number;
}

export interface StringState {
  fret: number | 'X' | 0;
  finger?: number;
}

export type GuitarStrings = [
  StringState,
  StringState,
  StringState,
  StringState,
  StringState,
  StringState,
];

export const STRING_NAMES = ['E', 'B', 'G', 'D', 'A', 'E'] as const;
export const STRING_NAMES_LOW_TO_HIGH = ['E', 'A', 'D', 'G', 'B', 'E'] as const;

export const TOTAL_FRETS = 21;
export const TOTAL_STRINGS = 6;
