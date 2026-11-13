import type { ChordData, StringState } from '@/types/chord';

// Chord data based on vexflow.com/vexchords - The Little Chord Chart
// Format: strings from low E to high E, fingering matches
const HAND_PICKED_CHORDS: ChordData[] = [
  // === OPEN CHORDS ===
  // C Major: [[1, 0], [2, 1, '1'], [3, 0], [4, 2, 2], [5, 3, 3]]
  { chordName: 'C,,,', strings: 'X 3 2 0 1 0', fingering: 'X 3 2 X 1 X' },
  // D Major: [[1, 2, 2], [2, 3, 3], [3, 2, '1'], [4, 0, 'D'], [5, 'x'], [6, 'x']]
  { chordName: 'D,,,', strings: 'X X 0 2 3 2', fingering: 'X X X 1 3 2' },
  // E Major: [[1, 0, 'E'], [2, 0], [3, 1, 1], [4, 2, 3], [5, 2, 2], [6, 0, 'E']]
  { chordName: 'E,,,', strings: '0 2 2 1 0 0', fingering: 'X 2 3 1 X X' },
  // G Major: [[1, 3, 4], [2, 3, 3], [3, 0, 'G'], [4, 0], [5, 2, 1], [6, 3, 2]]
  { chordName: 'G,,,', strings: '3 2 0 0 3 3', fingering: '2 1 X X 3 4' },
  // A Major: [[1, 0], [2, 2, 3], [3, 2, 2], [4, 2, 1], [5, 0, 'A'], [6, 'x']]
  { chordName: 'A,,,', strings: 'X 0 2 2 2 0', fingering: 'X X 1 2 3 X' },
  // D Minor: [[1, 1, 1], [2, 3, 3], [3, 2, 2], [4, 0, 'D'], [5, 'x'], [6, 'x']]
  { chordName: 'D,m,,', strings: 'X X 0 2 3 1', fingering: 'X X X 2 3 1' },
  // E Minor: [[1, 0], [2, 0], [3, 0], [4, 2, 3], [5, 2, 2], [6, 0, 'E']]
  { chordName: 'E,m,,', strings: '0 2 2 0 0 0', fingering: 'X 2 3 X X X' },
  // A Minor: [[1, 0], [2, 1, 1], [3, 2, 3], [4, 2, 2], [5, 0, 'A'], [6, 'x']]
  { chordName: 'A,m,,', strings: 'X 0 2 2 1 0', fingering: 'X X 2 3 1 X' },
  // C7: [[1, 0], [2, 1, 1], [3, 3, 4], [4, 2, 2], [5, 3, 3], [6, 'x']]
  { chordName: 'C,,7,', strings: 'X 3 2 3 1 0', fingering: 'X 3 2 4 1 X' },
  // D7: [[1, 2, 3], [2, 1, 1], [3, 2, 2], [4, 0, 'D'], [5, 'x'], [6, 'x']]
  { chordName: 'D,,7,', strings: 'X X 0 2 1 2', fingering: 'X X X 2 1 3' },
  // E7: [[1, 0], [2, 3, 4], [3, 1, 1], [4, 0], [5, 2, 2], [6, 0, 'E']]
  { chordName: 'E,,7,', strings: '0 2 0 1 3 0', fingering: 'X 2 X 1 4 X' },
  // G7: [[1, 1, 1], [2, 0], [3, 0], [4, 0], [5, 2, 2], [6, 3, 3]]
  { chordName: 'G,,7,', strings: '3 2 0 0 0 1', fingering: '3 2 X X X 1' },
  // A7: [[1, 0], [2, 2, 3], [3, 0], [4, 2, 2], [5, 0, 'A'], [6, 'x']]
  { chordName: 'A,,7,', strings: 'X 0 2 0 2 0', fingering: 'X X 2 X 3 X' },
  // Dm7: [[3, 2, 2], [4, 0], [5, 'x'], [6, 'x']], barres: [{ fromString: 2, toString: 1, fret: 1 }]
  { chordName: 'D,m,7,', strings: 'X X 0 2 1 1', fingering: 'X X X 2 1 1' },
  // Em7: [[1, 0], [2, 3, 4], [3, 0], [4, 0], [5, 2, 1], [6, 0, 'E']]
  { chordName: 'E,m,7,', strings: '0 2 0 0 3 0', fingering: 'X 1 X X 4 X' },
  // Am7: [[1, 0], [2, 1, 1], [3, 0], [4, 2, 2], [5, 0, 'A'], [6, 'x']]
  { chordName: 'A,m,7,', strings: 'X 0 2 0 1 0', fingering: 'X X 2 X 1 X' },
  // === F CHORDS (E Shape) ===
  { chordName: 'F,,,', strings: '1 3 3 2 1 1', fingering: '1 3 4 2 1 1' },
  { chordName: 'F,m,,', strings: '1 3 3 1 1 1', fingering: '1 3 4 1 1 1' },
  { chordName: 'F,,7,', strings: '1 3 1 2 1 1', fingering: '1 3 1 2 1 1' },
  { chordName: 'F,m,7,', strings: '1 3 1 1 1 1', fingering: '1 3 1 1 1 1' },
  { chordName: 'F,maj,7,', strings: '1 3 2 2 1 1', fingering: '1 4 2 3 1 1' },
  { chordName: 'F,m,7b5,', strings: '1 X 1 1 0 1', fingering: '1 X 2 3 X 4' },
  { chordName: 'F,dim,,', strings: '1 X 0 1 0 1', fingering: '1 X X 2 X 3' },
  { chordName: 'F,sus,2,', strings: '1 3 3 0 1 1', fingering: '1 3 4 X 1 1' },
  { chordName: 'F,sus,4,', strings: '1 3 3 3 1 1', fingering: '1 2 3 4 1 1' },
  { chordName: 'F,,7sus4,', strings: '1 3 1 3 1 1', fingering: '1 3 1 4 1 1' },
  { chordName: 'F,,9,', strings: '1 0 1 0 1 1', fingering: '1 X 2 X 3 4' },
  { chordName: 'F,,7b9,', strings: '1 0 1 2 1 2', fingering: '1 X 2 3 1 4' },
  { chordName: 'F,,7#9,', strings: '1 0 1 1 X X', fingering: '2 X 3 4 X X' },
  { chordName: 'F,,13,', strings: '1 3 1 2 3 1', fingering: '1 3 1 2 4 1' },
  // === Bb CHORDS (A Shape) ===
  { chordName: 'Bb,,,', strings: 'X 1 3 3 3 1', fingering: 'X 1 3 3 3 1' },
  { chordName: 'Bb,m,,', strings: 'X 1 3 3 2 1', fingering: 'X 1 3 4 2 1' },
  { chordName: 'Bb,,7,', strings: 'X 1 3 1 3 1', fingering: 'X 1 3 1 4 1' },
  { chordName: 'Bb,m,7,', strings: 'X 1 3 1 2 1', fingering: 'X 1 3 1 2 1' },
  { chordName: 'Bb,maj,7,', strings: 'X 1 3 2 3 1', fingering: 'X 1 3 2 4 1' },
  { chordName: 'Bb,m,7b5,', strings: 'X 1 2 1 2 X', fingering: 'X 1 2 1 3 X' },
  { chordName: 'Bb,dim,,', strings: 'X 1 2 0 2 X', fingering: 'X 1 2 X 3 X' },
  { chordName: 'Bb,sus,2,', strings: 'X 1 3 3 1 1', fingering: 'X 1 3 4 1 1' },
  { chordName: 'Bb,sus,4,', strings: 'X 1 3 3 4 1', fingering: 'X 1 2 3 4 1' },
  { chordName: 'Bb,,7sus4,', strings: 'X 1 3 1 4 1', fingering: 'X 1 3 1 4 1' },
  { chordName: 'Bb,,9,', strings: 'X 1 0 1 1 1', fingering: 'X 1 X 2 3 4' },
  { chordName: 'Bb,,7b9,', strings: 'X 1 0 1 0 1', fingering: 'X 2 X 3 X 4' },
  { chordName: 'Bb,,7#9,', strings: 'X 1 0 1 2 1', fingering: 'X 1 X 2 3 1' },
  { chordName: 'Bb,,13,', strings: 'X 1 3 1 3 3', fingering: 'X 1 3 1 2 4' },
  // === B CHORDS (A Shape) ===
  { chordName: 'B,,,', strings: 'X 2 4 4 4 2', fingering: 'X 1 3 3 3 1' },
  { chordName: 'B,m,,', strings: 'X 2 4 4 3 2', fingering: 'X 1 3 4 2 1' },
  { chordName: 'B,,7,', strings: 'X 2 4 2 4 2', fingering: 'X 1 3 1 4 1' },
  { chordName: 'B,m,7,', strings: 'X 2 4 2 3 2', fingering: 'X 1 3 1 2 1' },
  { chordName: 'B,maj,7,', strings: 'X 2 4 3 4 2', fingering: 'X 1 3 2 4 1' },
  { chordName: 'B,m,7b5,', strings: 'X 2 3 2 3 X', fingering: 'X 1 2 1 3 X' },
  { chordName: 'B,sus,2,', strings: 'X 2 4 4 2 2', fingering: 'X 1 3 4 1 1' },
  { chordName: 'B,sus,4,', strings: 'X 2 4 4 5 2', fingering: 'X 1 2 3 4 1' },
  { chordName: 'B,,7sus4,', strings: 'X 2 4 2 5 2', fingering: 'X 1 3 1 4 1' },
  { chordName: 'B,,13,', strings: 'X 2 4 2 4 4', fingering: 'X 1 3 1 2 4' },
  // === C CHORDS (A Shape) ===
  { chordName: 'C,m,,', strings: 'X 3 5 5 4 3', fingering: 'X 1 3 4 2 1' },
  { chordName: 'C,m,7,', strings: 'X 3 5 3 4 3', fingering: 'X 1 3 1 2 1' },
  { chordName: 'C,maj,7,', strings: 'X 3 5 4 5 3', fingering: 'X 1 3 2 4 1' },
  { chordName: 'C,m,7b5,', strings: 'X 3 4 3 4 X', fingering: 'X 1 2 1 3 X' },
  { chordName: 'C,sus,2,', strings: 'X 3 5 5 3 3', fingering: 'X 1 3 4 1 1' },
  { chordName: 'C,sus,4,', strings: 'X 3 5 5 6 3', fingering: 'X 1 2 3 4 1' },
  { chordName: 'C,,7sus4,', strings: 'X 3 5 3 6 3', fingering: 'X 1 3 1 4 1' },
  { chordName: 'C,,13,', strings: 'X 3 5 3 5 5', fingering: 'X 1 3 1 2 4' },
  // === G CHORDS (E Shape barre) ===
  { chordName: 'G,m,,', strings: '3 5 5 3 3 3', fingering: '1 3 4 1 1 1' },
  { chordName: 'G,m,7,', strings: '3 5 3 3 3 3', fingering: '1 3 1 1 1 1' },
  { chordName: 'G,maj,7,', strings: '3 5 4 4 3 3', fingering: '1 4 2 3 1 1' },
  { chordName: 'G,sus,4,', strings: '3 5 5 5 3 3', fingering: '1 2 3 4 1 1' },
  { chordName: 'G,,7sus4,', strings: '3 5 3 5 3 3', fingering: '1 3 1 4 1 1' },
  { chordName: 'G,,13,', strings: '3 5 3 4 5 3', fingering: '1 3 1 2 4 1' },
  // === A CHORDS (extended) ===
  { chordName: 'A,m,7b5,', strings: 'X 0 1 0 1 X', fingering: 'X X 1 X 2 X' },
  { chordName: 'A,dim,,', strings: 'X 0 1 2 1 X', fingering: 'X X 1 3 2 X' },
  { chordName: 'A,sus,2,', strings: 'X 0 2 2 0 0', fingering: 'X X 1 2 X X' },
  { chordName: 'A,sus,4,', strings: 'X 0 2 2 3 0', fingering: 'X X 1 2 3 X' },
  { chordName: 'A,,7sus4,', strings: 'X 0 2 0 3 0', fingering: 'X X 1 X 3 X' },
  { chordName: 'A,,9,', strings: 'X 0 2 4 2 3', fingering: 'X X 1 3 1 2' },
  { chordName: 'A,,7b9,', strings: 'X 0 2 3 2 3', fingering: 'X X 1 3 2 4' },
  { chordName: 'A,,7#9,', strings: 'X 0 5 6 5 8', fingering: 'X X 1 2 1 4' },
  { chordName: 'A,,13,', strings: 'X 0 2 0 2 2', fingering: 'X X 2 X 3 4' },
  { chordName: 'A,maj,7,', strings: 'X 0 2 1 2 0', fingering: 'X X 2 1 3 X' },
  // === E CHORDS (extended) ===
  { chordName: 'E,m,7b5,', strings: '0 1 0 0 3 0', fingering: 'X 1 X X 4 X' },
  { chordName: 'E,dim,,', strings: 'X X 2 3 2 3', fingering: 'X X 1 3 2 4' },
  { chordName: 'E,sus,2,', strings: '0 2 4 4 0 0', fingering: 'X 1 3 4 X X' },
  { chordName: 'E,sus,4,', strings: '0 2 2 2 0 0', fingering: 'X 2 3 4 X X' },
  { chordName: 'E,,7sus4,', strings: '0 2 0 2 0 0', fingering: 'X 2 X 3 X X' },
  { chordName: 'E,,9,', strings: '0 2 0 1 0 2', fingering: 'X 2 X 1 X 3' },
  { chordName: 'E,,7b9,', strings: '0 2 0 1 0 1', fingering: 'X 3 X 1 X 2' },
  { chordName: 'E,,7#9,', strings: '0 2 0 1 3 3', fingering: 'X 2 X 1 3 4' },
  { chordName: 'E,,13,', strings: '0 2 0 1 2 0', fingering: 'X 2 X 1 3 X' },
  { chordName: 'E,maj,7,', strings: '0 2 1 1 0 0', fingering: 'X 3 1 2 X X' },
  // === D CHORDS (extended) ===
  { chordName: 'D,m,7b5,', strings: 'X X 0 1 1 1', fingering: 'X X X 1 2 3' },
  { chordName: 'D,dim,,', strings: 'X X 0 1 0 1', fingering: 'X X X 1 X 2' },
  { chordName: 'D,sus,2,', strings: 'X X 0 2 3 0', fingering: 'X X X 1 3 X' },
  { chordName: 'D,sus,4,', strings: 'X X 0 2 3 3', fingering: 'X X X 1 2 3' },
  { chordName: 'D,,7sus4,', strings: 'X X 0 2 1 3', fingering: 'X X X 2 1 4' },
  { chordName: 'D,,9,', strings: 'X X 0 2 1 0', fingering: 'X X X 2 1 X' },
  { chordName: 'D,,7b9,', strings: 'X 5 4 5 4 X', fingering: 'X 2 1 3 1 X' },
  { chordName: 'D,,7#9,', strings: 'X 5 4 5 6 X', fingering: 'X 2 1 3 4 X' },
  { chordName: 'D,,13,', strings: 'X 5 4 5 7 7', fingering: 'X 2 1 3 4 4' },
  { chordName: 'D,maj,7,', strings: 'X X 0 2 2 2', fingering: 'X X X 1 1 1' },
  // === MORE OPEN CHORDS ===
  { chordName: 'B,,7,', strings: 'X 2 1 2 0 2', fingering: 'X 2 1 3 X 4' },
  { chordName: 'C,maj,7,', strings: 'X 3 2 0 0 0', fingering: 'X 3 2 X X X' },
  { chordName: 'F,maj,7,', strings: 'X X 3 2 1 0', fingering: 'X X 3 2 1 X' },
  { chordName: 'G,maj,7,', strings: '3 2 0 0 0 2', fingering: '2 1 X X X 3' },
  { chordName: 'G,sus,2,', strings: '3 0 0 0 3 3', fingering: '1 X X X 3 4' },
  { chordName: 'C,add,9,', strings: 'X 3 2 0 3 0', fingering: 'X 2 1 X 3 X' },
  { chordName: 'G,add,9,', strings: '3 2 0 2 0 3', fingering: '2 1 X 3 X 4' },
  { chordName: 'E,add,9,', strings: '0 2 2 1 0 2', fingering: 'X 2 3 1 X 4' },
  { chordName: 'A,add,9,', strings: 'X 0 2 4 2 0', fingering: 'X X 1 3 1 X' },
  { chordName: 'G,,6,', strings: '3 2 0 0 0 0', fingering: '2 1 X X X X' },
  { chordName: 'C,,6,', strings: 'X 3 2 2 1 0', fingering: 'X 4 2 3 1 X' },
  { chordName: 'A,,6,', strings: 'X 0 2 2 2 2', fingering: 'X X 1 1 1 1' },
  { chordName: 'D,,6,', strings: 'X X 0 2 0 2', fingering: 'X X X 1 X 2' },
  { chordName: 'E,,6,', strings: '0 2 2 1 2 0', fingering: 'X 2 3 1 4 X' },
  { chordName: 'A,m,6,', strings: 'X 0 2 2 1 2', fingering: 'X X 2 3 1 4' },
  { chordName: 'D,m,6,', strings: 'X X 0 2 0 1', fingering: 'X X X 2 X 1' },
  { chordName: 'E,m,6,', strings: '0 2 2 0 2 0', fingering: 'X 1 2 X 3 X' },
  { chordName: 'E,m,9,', strings: '0 2 0 0 0 2', fingering: 'X 1 X X X 2' },
  { chordName: 'A,m,9,', strings: 'X 0 2 4 1 3', fingering: 'X X 2 4 1 3' },
  { chordName: 'C,aug,,', strings: 'X 3 2 1 1 0', fingering: 'X 4 3 1 2 X' },
  { chordName: 'E,aug,,', strings: '0 3 2 1 1 0', fingering: 'X 4 3 1 2 X' },
  { chordName: 'A,aug,,', strings: 'X 0 3 2 2 1', fingering: 'X X 4 2 3 1' },
  { chordName: 'D,aug,,', strings: 'X X 0 3 3 2', fingering: 'X X X 2 3 1' },
  { chordName: 'G,aug,,', strings: '3 2 1 0 0 3', fingering: '3 2 1 X X 4' },
  { chordName: 'E,,5,', strings: '0 2 2 X X X', fingering: 'X 1 2 X X X' },
  { chordName: 'A,,5,', strings: 'X 0 2 2 X X', fingering: 'X X 1 2 X X' },
  { chordName: 'D,,5,', strings: 'X X 0 2 3 X', fingering: 'X X X 1 3 X' },
  // === COMMON VARIANTS ===
  // Other ways players often hold the same open chords
  { chordName: 'G,,,', strings: '3 2 0 0 0 3', fingering: '2 1 X X X 3' },
  { chordName: 'F,,,', strings: 'X X 3 2 1 1', fingering: 'X X 3 2 1 1' },
  { chordName: 'C,,,', strings: 'X 3 2 0 1 3', fingering: 'X 3 2 X 1 4' },
  { chordName: 'E,,7,', strings: '0 2 2 1 3 0', fingering: 'X 2 3 1 4 X' },
  { chordName: 'A,,7,', strings: 'X 0 2 2 2 3', fingering: 'X X 1 1 1 2' },
  // === SLASH CHORDS ===
  { chordName: 'G,,,B', strings: 'X 2 0 0 3 3', fingering: 'X 1 X X 3 4' },
  { chordName: 'D,,,F#', strings: '2 0 0 2 3 2', fingering: '1 X X 2 4 3' },
  { chordName: 'C,,,G', strings: '3 3 2 0 1 0', fingering: '3 4 2 X 1 X' },
  { chordName: 'C,,,E', strings: '0 3 2 0 1 0', fingering: 'X 3 2 X 1 X' },
  { chordName: 'A,m,,G', strings: '3 0 2 2 1 0', fingering: '4 X 2 3 1 X' },
  { chordName: 'A,m,,E', strings: '0 0 2 2 1 0', fingering: 'X X 2 3 1 X' },
  { chordName: 'A,,,C#', strings: 'X 4 2 2 2 0', fingering: 'X 3 1 1 1 X' },
  { chordName: 'D,,,A', strings: 'X 0 0 2 3 2', fingering: 'X X X 1 3 2' },
  { chordName: 'D,m,,F', strings: 'X X 3 2 3 1', fingering: 'X X 3 2 4 1' },
  { chordName: 'E,,,G#', strings: '4 2 2 1 0 0', fingering: '4 2 3 1 X X' },
  { chordName: 'F,,,C', strings: 'X 3 3 2 1 1', fingering: 'X 3 4 2 1 1' },
  { chordName: 'G,,,D', strings: 'X X 0 0 0 3', fingering: 'X X X X X 3' },
];

// --------------------------------------------------
// Movable shapes
// Every root gets every chord type. Where no shape was picked by hand above,
// one is built from the two barre-chord families: the E shape (root on the
// 6th string) and the A shape (root on the 5th string).
// --------------------------------------------------

export const CHORD_ROOTS = [
  'C',
  'C#',
  'D',
  'Eb',
  'E',
  'F',
  'F#',
  'G',
  'Ab',
  'A',
  'Bb',
  'B',
] as const;

/** Chord types in display order, as [quality, tension] pairs of a chord name. */
export const CHORD_TYPES = [
  ['', ''],
  ['m', ''],
  ['', '7'],
  ['m', '7'],
  ['maj', '7'],
  ['', '6'],
  ['m', '6'],
  ['sus', '2'],
  ['sus', '4'],
  ['', '7sus4'],
  ['add', '9'],
  ['', '9'],
  ['m', '9'],
  ['maj', '9'],
  ['', '13'],
  ['', '7b9'],
  ['', '7#9'],
  ['dim', ''],
  ['m', '7b5'],
  ['aug', ''],
  ['', '5'],
] as const;

// Fret offsets from the barre, low string first; null is a muted string.
// Fingers: 1 index, 2 middle, 3 ring, 4 pinky.
type MovableShape = readonly [
  frets: readonly (number | null)[],
  fingers: readonly (number | null)[],
];
const _ = null;

const E_SHAPES: Record<string, MovableShape> = {
  ',': [
    [0, 2, 2, 1, 0, 0],
    [1, 3, 4, 2, 1, 1],
  ],
  'm,': [
    [0, 2, 2, 0, 0, 0],
    [1, 3, 4, 1, 1, 1],
  ],
  ',7': [
    [0, 2, 0, 1, 0, 0],
    [1, 3, 1, 2, 1, 1],
  ],
  'm,7': [
    [0, 2, 0, 0, 0, 0],
    [1, 3, 1, 1, 1, 1],
  ],
  'maj,7': [
    [0, 2, 1, 1, 0, 0],
    [1, 4, 2, 3, 1, 1],
  ],
  ',6': [
    [0, _, -1, 1, 0, _],
    [2, _, 1, 4, 3, _],
  ],
  'm,6': [
    [0, _, -1, 0, 0, _],
    [2, _, 1, 3, 4, _],
  ],
  'sus,2': [
    [0, 2, 4, 4, 0, 0],
    [1, 2, 3, 4, 1, 1],
  ],
  'sus,4': [
    [0, 2, 2, 2, 0, 0],
    [1, 2, 3, 4, 1, 1],
  ],
  ',7sus4': [
    [0, 2, 0, 2, 0, 0],
    [1, 3, 1, 4, 1, 1],
  ],
  'add,9': [
    [0, 2, _, 1, 0, 2],
    [1, 3, _, 2, 1, 4],
  ],
  ',9': [
    [0, -1, 0, -1, 0, _],
    [2, 1, 3, 1, 4, _],
  ],
  'm,9': [
    [0, 2, 0, 0, 0, 2],
    [1, 3, 1, 1, 1, 4],
  ],
  'maj,9': [
    [0, _, 1, 1, 0, 2],
    [1, _, 2, 3, 1, 4],
  ],
  ',13': [
    [0, _, 0, 1, 2, _],
    [1, _, 2, 3, 4, _],
  ],
  ',7b9': [
    [0, -1, 0, -2, _, _],
    [3, 2, 4, 1, _, _],
  ],
  ',7#9': [
    [0, -1, 0, 0, _, _],
    [2, 1, 3, 4, _, _],
  ],
  'dim,': [
    [0, _, -1, 0, -1, _],
    [2, _, 1, 3, 1, _],
  ],
  'm,7b5': [
    [0, _, 0, 0, -1, _],
    [2, _, 3, 4, 1, _],
  ],
  'aug,': [
    [0, _, 2, 1, 1, _],
    [1, _, 4, 2, 3, _],
  ],
  ',5': [
    [0, 2, 2, _, _, _],
    [1, 3, 4, _, _, _],
  ],
};

const A_SHAPES: Record<string, MovableShape> = {
  ',': [
    [_, 0, 2, 2, 2, 0],
    [_, 1, 3, 3, 3, 1],
  ],
  'm,': [
    [_, 0, 2, 2, 1, 0],
    [_, 1, 3, 4, 2, 1],
  ],
  ',7': [
    [_, 0, 2, 0, 2, 0],
    [_, 1, 3, 1, 4, 1],
  ],
  'm,7': [
    [_, 0, 2, 0, 1, 0],
    [_, 1, 3, 1, 2, 1],
  ],
  'maj,7': [
    [_, 0, 2, 1, 2, 0],
    [_, 1, 3, 2, 4, 1],
  ],
  ',6': [
    [_, 0, 2, 2, 2, 2],
    [_, 1, 3, 3, 3, 3],
  ],
  'm,6': [
    [_, 0, 2, 2, 1, 2],
    [_, 1, 3, 3, 2, 4],
  ],
  'sus,2': [
    [_, 0, 2, 2, 0, 0],
    [_, 1, 3, 4, 1, 1],
  ],
  'sus,4': [
    [_, 0, 2, 2, 3, 0],
    [_, 1, 2, 3, 4, 1],
  ],
  ',7sus4': [
    [_, 0, 2, 0, 3, 0],
    [_, 1, 3, 1, 4, 1],
  ],
  'add,9': [
    [_, 0, 2, 4, 2, 0],
    [_, 1, 2, 4, 3, 1],
  ],
  ',9': [
    [_, 0, -1, 0, 0, 0],
    [_, 2, 1, 3, 3, 3],
  ],
  'm,9': [
    [_, 0, -2, 0, 0, 0],
    [_, 2, 1, 3, 3, 3],
  ],
  'maj,9': [
    [_, 0, -1, 1, 0, _],
    [_, 2, 1, 4, 3, _],
  ],
  ',13': [
    [_, 0, 2, 0, 2, 2],
    [_, 1, 3, 1, 4, 4],
  ],
  ',7b9': [
    [_, 0, -1, 0, -1, _],
    [_, 2, 1, 3, 1, _],
  ],
  ',7#9': [
    [_, 0, -1, 0, 1, _],
    [_, 2, 1, 3, 4, _],
  ],
  'dim,': [
    [_, 0, 1, -1, 1, _],
    [_, 2, 3, 1, 4, _],
  ],
  'm,7b5': [
    [_, 0, 1, 0, 1, _],
    [_, 1, 3, 2, 4, _],
  ],
  'aug,': [
    [_, 0, -1, -2, -2, _],
    [_, 4, 3, 1, 2, _],
  ],
  ',5': [
    [_, 0, 2, 2, _, _],
    [_, 1, 3, 4, _, _],
  ],
};

// The fret where each family's root note falls for C (pitch class 0)
const E_SHAPE_C_FRET = 8;
const A_SHAPE_C_FRET = 3;

function placeShape(
  [offsets, fingers]: MovableShape,
  barre: number
): Pick<ChordData, 'strings' | 'fingering'> | null {
  const frets = offsets.map((offset) =>
    offset === null ? null : barre + offset
  );
  if (frets.some((fret) => fret !== null && fret < 0)) return null;

  // With open strings there is no barre: the remaining fingers move down
  const hasOpen = frets.some((fret) => fret === 0);
  const used = [
    ...new Set(
      fingers.filter((finger, i) => finger !== null && frets[i] !== 0)
    ),
  ].sort() as number[];

  return {
    strings: frets.map((fret) => (fret === null ? 'X' : fret)).join(' '),
    fingering: fingers
      .map((finger, i) => {
        if (finger === null || frets[i] === 0) return 'X';
        return hasOpen ? used.indexOf(finger) + 1 : finger;
      })
      .join(' '),
  };
}

function buildMovableChords(existing: ChordData[]): ChordData[] {
  const names = new Set(existing.map((chord) => chord.chordName));
  const shapes = new Set(existing.map((chord) => chord.strings));
  const built: ChordData[] = [];

  CHORD_ROOTS.forEach((root, pitchClass) => {
    for (const [quality, tension] of CHORD_TYPES) {
      const chordName = `${root},${quality},${tension},`;
      if (names.has(chordName)) continue;

      const type = `${quality},${tension}`;
      const candidates = [
        placeShape(E_SHAPES[type], (E_SHAPE_C_FRET + pitchClass) % 12),
        placeShape(A_SHAPES[type], (A_SHAPE_C_FRET + pitchClass) % 12),
        // Shapes that reach below the nut are tried an octave up
        placeShape(E_SHAPES[type], ((E_SHAPE_C_FRET + pitchClass) % 12) + 12),
        placeShape(A_SHAPES[type], ((A_SHAPE_C_FRET + pitchClass) % 12) + 12),
      ].filter(
        (shape): shape is NonNullable<typeof shape> =>
          shape !== null && !shapes.has(shape.strings)
      );
      if (candidates.length === 0) continue;

      // Lowest position on the neck wins
      const highestFret = (shape: { strings: string }) =>
        Math.max(...shape.strings.split(' ').map((fret) => Number(fret) || 0));
      const best = candidates.reduce((a, b) =>
        highestFret(b) < highestFret(a) ? b : a
      );

      built.push({ chordName, ...best });
      shapes.add(best.strings);
    }
  });

  return built;
}

export const COMMON_CHORDS: ChordData[] = [
  ...HAND_PICKED_CHORDS,
  ...buildMovableChords(HAND_PICKED_CHORDS),
];

// "Db" and "C#" are the same chord: searches are folded onto one spelling
const ENHARMONIC_ROOTS: Record<string, string> = {
  db: 'c#',
  'd#': 'eb',
  gb: 'f#',
  'g#': 'ab',
  'a#': 'bb',
};

export function normalizeChordQuery(str: string): string {
  return str
    .toLowerCase()
    .replace(/\//g, '')
    .replace(/♯/g, '#')
    .replace(/♭/g, 'b')
    .trim();
}

/** "Db7" also means "C#7": respell a query's root the way the library does. */
function respellRoot(query: string): string {
  const root = query.slice(0, 2);
  return root in ENHARMONIC_ROOTS
    ? ENHARMONIC_ROOTS[root] + query.slice(2)
    : query;
}

export function searchChords(query: string): ChordData[] {
  const typed = normalizeChordQuery(query);
  if (!typed) return [];
  // "gb" could be G/B or G flat, so both readings are searched,
  // unless the slash was typed
  const queries = query.includes('/')
    ? [typed]
    : [...new Set([typed, respellRoot(typed)])];

  // Lower is better: exact name, then names starting with the query
  const rank = (name: string) =>
    Math.min(
      ...queries.map((q, i) => {
        if (name === q) return i;
        if (name.startsWith(q)) return 10 + i;
        if (name.includes(q)) return 20 + i;
        // A longer query still offers the simpler chords it builds on
        if (name.length > 1 && q.startsWith(name)) return 30 + i;
        return Number.POSITIVE_INFINITY;
      })
    );

  return COMMON_CHORDS.map((chord) => {
    const name = normalizeChordQuery(formatChordName(chord.chordName));
    return { chord, name, rank: rank(name) };
  })
    .filter((entry) => Number.isFinite(entry.rank))
    .sort((a, b) => a.rank - b.rank || a.name.length - b.name.length)
    .map((entry) => entry.chord);
}

export function formatChordName(chordName: string): string {
  const parts = chordName.split(',');
  const root = parts[0] || '';
  const quality = parts[1] || '';
  const tension = parts[2] || '';
  const bass = parts[3] || '';

  let name = root + quality + tension;
  if (bass) {
    name += `/${bass}`;
  }
  return name || chordName;
}

/** Convert library chord data (low E to high E) into fretboard state (high E to low E). */
export function chordToStrings(chord: ChordData): StringState[] {
  const fretValues = chord.strings.split(' ');
  const fingerValues = chord.fingering.split(' ');

  const states = fretValues.map((value, index): StringState => {
    if (value === 'X') {
      return { fret: 'X', finger: undefined };
    }
    const finger = Number.parseInt(fingerValues[index] ?? '', 10);
    return {
      fret: Number.parseInt(value, 10),
      finger: Number.isNaN(finger) || finger === 0 ? undefined : finger,
    };
  });

  return states.reverse();
}

export function stringsToPattern(
  strings: { fret: number | 'X' | 0 }[]
): string {
  // Reverse because UI is high E to low E, but chord data is low E to high E
  const reversed = [...strings].reverse();
  return reversed
    .map((s) => (s.fret === 'X' ? 'X' : s.fret.toString()))
    .join(' ');
}

/** The library's usual shape for a chord name such as "G" or "C/G". */
export function findLibraryChordByName(name: string): ChordData | undefined {
  return COMMON_CHORDS.find(
    (chord) => formatChordName(chord.chordName) === name
  );
}

/** The library chord with exactly these frets, if any (standard tuning). */
export function findLibraryChord(
  strings: { fret: number | 'X' | 0 }[]
): ChordData | undefined {
  const pattern = stringsToPattern(strings);
  return COMMON_CHORDS.find((chord) => chord.strings === pattern);
}

// The chords most songs are built from, in the order players learn them
const POPULAR_CHORD_NAMES = [
  'G,,,',
  'C,,,',
  'D,,,',
  'E,m,,',
  'A,m,,',
  'E,,,',
  'A,,,',
  'D,m,,',
  'F,,,',
  'G,,7,',
  'D,,7,',
  'E,,7,',
  'A,,7,',
  'B,,7,',
  'B,m,,',
  'C,,,G',
];

export function getPopularChords(): ChordData[] {
  return POPULAR_CHORD_NAMES.map((name) =>
    COMMON_CHORDS.find((chord) => chord.chordName === name)
  ).filter((chord): chord is ChordData => chord !== undefined);
}

export function detectChordName(
  strings: { fret: number | 'X' | 0 }[]
): string | null {
  const pattern = stringsToPattern(strings);

  // Find exact match
  const exactMatch = COMMON_CHORDS.find((chord) => chord.strings === pattern);
  if (exactMatch) {
    return formatChordName(exactMatch.chordName);
  }

  // If no exact match, return null
  return null;
}

// Root notes in order
export const ROOT_NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;

// Get all chords grouped by root note
export function getChordsByRoot(): Record<string, ChordData[]> {
  const grouped: Record<string, ChordData[]> = {};
  for (const root of ROOT_NOTES) {
    grouped[root] = COMMON_CHORDS.filter((chord) =>
      chord.chordName.startsWith(`${root},`)
    );
  }
  return grouped;
}

// Chord categories for organized display
export interface ChordCategory {
  /** Short label for the jump links, e.g. "Open" or "F#" */
  id: string;
  name: string;
  description: string;
  chords: ChordData[];
}

const BASIC_TYPES = new Set([',', 'm,', ',7', 'm,7', 'maj,7']);

const chordParts = (chord: ChordData) => {
  const [root = '', quality = '', tension = '', bass = ''] =
    chord.chordName.split(',');
  return { root, type: `${quality},${tension}`, bass };
};

const typeRank = (chord: ChordData) => {
  const { type } = chordParts(chord);
  const rank = CHORD_TYPES.findIndex(
    ([quality, tension]) => `${quality},${tension}` === type
  );
  return rank === -1 ? CHORD_TYPES.length : rank;
};

/** The library grouped for browsing: open chords, slash chords, then every root. */
export function getChordsByCategory(): ChordCategory[] {
  const categories: ChordCategory[] = [
    {
      id: 'Open',
      name: 'Open chords',
      description:
        'The first chords most players learn, with open strings left ringing.',
      chords: HAND_PICKED_CHORDS.filter((chord) => {
        const { type, bass } = chordParts(chord);
        return (
          !bass &&
          BASIC_TYPES.has(type) &&
          chord.strings.split(' ').includes('0')
        );
      }).sort((a, b) => typeRank(a) - typeRank(b)),
    },
    {
      id: 'Slash',
      name: 'Slash chords',
      description: 'Familiar chords with a different note in the bass.',
      chords: COMMON_CHORDS.filter((chord) => chordParts(chord).bass !== ''),
    },
    ...CHORD_ROOTS.map((root) => ({
      id: root,
      name: `${root} chords`,
      description: '',
      chords: COMMON_CHORDS.filter((chord) => {
        const parts = chordParts(chord);
        return parts.root === root && !parts.bass;
      }).sort((a, b) => typeRank(a) - typeRank(b)),
    })),
  ];

  return categories.filter((category) => category.chords.length > 0);
}
