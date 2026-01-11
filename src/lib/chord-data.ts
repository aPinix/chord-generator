import type { ChordData } from '@/types/chord';

// Chord data based on vexflow.com/vexchords - The Little Chord Chart
// Format: strings from low E to high E, fingering matches
export const COMMON_CHORDS: ChordData[] = [
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
  { chordName: 'F,,7b9,', strings: '1 0 1 0 1 0', fingering: '2 X 3 X 4 X' },
  { chordName: 'F,,7#9,', strings: '1 0 1 2 1 2', fingering: '1 X 2 3 1 4' },
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
  { chordName: 'B,dim,,', strings: 'X 2 3 1 3 X', fingering: 'X 1 2 X 3 X' },
  { chordName: 'B,sus,2,', strings: 'X 2 4 4 2 2', fingering: 'X 1 3 4 1 1' },
  { chordName: 'B,sus,4,', strings: 'X 2 4 4 5 2', fingering: 'X 1 2 3 4 1' },
  { chordName: 'B,,7sus4,', strings: 'X 2 4 2 5 2', fingering: 'X 1 3 1 4 1' },
  { chordName: 'B,,9,', strings: 'X 2 1 2 2 2', fingering: 'X 1 X 2 3 4' },
  { chordName: 'B,,7b9,', strings: 'X 2 1 2 1 2', fingering: 'X 2 X 3 X 4' },
  { chordName: 'B,,7#9,', strings: 'X 2 1 2 3 2', fingering: 'X 1 X 2 3 1' },
  { chordName: 'B,,13,', strings: 'X 2 4 2 4 4', fingering: 'X 1 3 1 2 4' },
  // === C CHORDS (A Shape) ===
  { chordName: 'C,m,,', strings: 'X 3 5 5 4 3', fingering: 'X 1 3 4 2 1' },
  { chordName: 'C,m,7,', strings: 'X 3 5 3 4 3', fingering: 'X 1 3 1 2 1' },
  { chordName: 'C,maj,7,', strings: 'X 3 5 4 5 3', fingering: 'X 1 3 2 4 1' },
  { chordName: 'C,m,7b5,', strings: 'X 3 4 3 4 X', fingering: 'X 1 2 1 3 X' },
  { chordName: 'C,dim,,', strings: 'X 3 4 2 4 X', fingering: 'X 1 2 X 3 X' },
  { chordName: 'C,sus,2,', strings: 'X 3 5 5 3 3', fingering: 'X 1 3 4 1 1' },
  { chordName: 'C,sus,4,', strings: 'X 3 5 5 6 3', fingering: 'X 1 2 3 4 1' },
  { chordName: 'C,,7sus4,', strings: 'X 3 5 3 6 3', fingering: 'X 1 3 1 4 1' },
  { chordName: 'C,,9,', strings: 'X 3 2 3 3 3', fingering: 'X 1 X 2 3 4' },
  { chordName: 'C,,7b9,', strings: 'X 3 2 3 2 3', fingering: 'X 2 X 3 X 4' },
  { chordName: 'C,,7#9,', strings: 'X 3 2 3 4 3', fingering: 'X 1 X 2 3 1' },
  { chordName: 'C,,13,', strings: 'X 3 5 3 5 5', fingering: 'X 1 3 1 2 4' },
  // === G CHORDS (E Shape barre) ===
  { chordName: 'G,m,,', strings: '3 5 5 3 3 3', fingering: '1 3 4 1 1 1' },
  { chordName: 'G,m,7,', strings: '3 5 3 3 3 3', fingering: '1 3 1 1 1 1' },
  { chordName: 'G,maj,7,', strings: '3 5 4 4 3 3', fingering: '1 4 2 3 1 1' },
  { chordName: 'G,m,7b5,', strings: '3 X 3 3 2 3', fingering: '1 X 2 3 X 4' },
  { chordName: 'G,dim,,', strings: '3 X 2 3 2 3', fingering: '1 X X 2 X 3' },
  { chordName: 'G,sus,2,', strings: '3 5 5 2 3 3', fingering: '1 3 4 X 1 1' },
  { chordName: 'G,sus,4,', strings: '3 5 5 5 3 3', fingering: '1 2 3 4 1 1' },
  { chordName: 'G,,7sus4,', strings: '3 5 3 5 3 3', fingering: '1 3 1 4 1 1' },
  { chordName: 'G,,9,', strings: '3 2 3 2 3 3', fingering: '1 X 2 X 3 4' },
  { chordName: 'G,,7b9,', strings: '3 2 3 2 3 X', fingering: '2 X 3 X 4 X' },
  { chordName: 'G,,7#9,', strings: '3 2 3 4 3 4', fingering: '1 X 2 3 1 4' },
  { chordName: 'G,,13,', strings: '3 5 3 4 5 3', fingering: '1 3 1 2 4 1' },
  // === A CHORDS (extended) ===
  { chordName: 'A,m,7b5,', strings: 'X 0 1 0 1 X', fingering: 'X X 1 X 2 X' },
  { chordName: 'A,dim,,', strings: 'X 0 1 2 1 X', fingering: 'X X 1 3 2 X' },
  { chordName: 'A,sus,2,', strings: 'X 0 2 2 0 0', fingering: 'X X 1 2 X X' },
  { chordName: 'A,sus,4,', strings: 'X 0 2 2 3 0', fingering: 'X X 1 2 3 X' },
  { chordName: 'A,,7sus4,', strings: 'X 0 2 0 3 0', fingering: 'X X 1 X 3 X' },
  { chordName: 'A,,9,', strings: 'X 0 2 4 2 3', fingering: 'X X 1 3 1 2' },
  { chordName: 'A,,7b9,', strings: 'X 0 2 0 2 3', fingering: 'X X 1 X 1 2' },
  { chordName: 'A,,7#9,', strings: 'X 0 2 0 2 3', fingering: 'X X 1 X 1 2' },
  { chordName: 'A,,13,', strings: 'X 0 2 0 2 2', fingering: 'X X 2 X 3 4' },
  { chordName: 'A,maj,7,', strings: 'X 0 2 1 2 0', fingering: 'X X 2 1 3 X' },
  // === E CHORDS (extended) ===
  { chordName: 'E,m,7b5,', strings: '0 1 0 0 0 0', fingering: 'X 1 X X X X' },
  { chordName: 'E,dim,,', strings: 'X X 2 3 2 3', fingering: 'X X 1 3 2 4' },
  { chordName: 'E,sus,2,', strings: '0 2 4 4 0 0', fingering: 'X 1 3 4 X X' },
  { chordName: 'E,sus,4,', strings: '0 2 2 2 0 0', fingering: 'X 2 3 4 X X' },
  { chordName: 'E,,7sus4,', strings: '0 2 0 2 0 0', fingering: 'X 2 X 3 X X' },
  { chordName: 'E,,9,', strings: '0 2 0 1 0 2', fingering: 'X 2 X 1 X 3' },
  { chordName: 'E,,7b9,', strings: '0 2 0 1 3 0', fingering: 'X 2 X 1 4 X' },
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
  { chordName: 'D,,7b9,', strings: 'X X 0 2 1 3', fingering: 'X X X 2 1 4' },
  { chordName: 'D,,7#9,', strings: 'X X 0 2 1 3', fingering: 'X X X 2 1 4' },
  { chordName: 'D,,13,', strings: 'X X 0 2 1 2', fingering: 'X X X 2 1 3' },
  { chordName: 'D,maj,7,', strings: 'X X 0 2 2 2', fingering: 'X X X 1 1 1' },
];

export function normalizeChordQuery(str: string): string {
  return str.toLowerCase().replace(/\//g, '').trim();
}

export function searchChords(query: string): ChordData[] {
  const normalizedQuery = normalizeChordQuery(query);
  return COMMON_CHORDS.filter((chord) => {
    const formattedName = normalizeChordQuery(formatChordName(chord.chordName));
    return (
      formattedName.includes(normalizedQuery) ||
      normalizedQuery.includes(formattedName)
    );
  }).sort((a, b) => {
    const nameA = normalizeChordQuery(formatChordName(a.chordName));
    const nameB = normalizeChordQuery(formatChordName(b.chordName));
    const exactA = nameA === normalizedQuery;
    const exactB = nameB === normalizedQuery;
    if (exactA && !exactB) return -1;
    if (exactB && !exactA) return 1;
    const startsA = nameA.startsWith(normalizedQuery);
    const startsB = nameB.startsWith(normalizedQuery);
    if (startsA && !startsB) return -1;
    if (startsB && !startsA) return 1;
    return nameA.length - nameB.length;
  });
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

export function stringsToPattern(
  strings: { fret: number | 'X' | 0 }[]
): string {
  // Reverse because UI is high E to low E, but chord data is low E to high E
  const reversed = [...strings].reverse();
  return reversed
    .map((s) => (s.fret === 'X' ? 'X' : s.fret.toString()))
    .join(' ');
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
  name: string;
  description: string;
  chords: ChordData[];
}

// Get chords organized by category (matching vexflow.com/vexchords layout)
export function getChordsByCategory(): ChordCategory[] {
  const categories: ChordCategory[] = [
    {
      name: 'Open Chords',
      description:
        'These chords are played in open position, and generally include open strings.',
      chords: COMMON_CHORDS.filter((c) =>
        [
          'C,,,',
          'D,,,',
          'E,,,',
          'G,,,',
          'A,,,',
          'D,m,,',
          'E,m,,',
          'A,m,,',
          'C,,7,',
          'D,,7,',
          'E,,7,',
          'G,,7,',
          'A,,7,',
          'D,m,7,',
          'E,m,7,',
          'A,m,7,',
        ].includes(c.chordName)
      ),
    },
    {
      name: 'F Chords (E Shape)',
      description: 'E-Shaped barre chords in the key of F.',
      chords: COMMON_CHORDS.filter((c) => c.chordName.startsWith('F,')),
    },
    {
      name: 'Bb Chords (A Shape)',
      description: 'A-Shaped barre chords in the key of Bb.',
      chords: COMMON_CHORDS.filter((c) => c.chordName.startsWith('Bb,')),
    },
    {
      name: 'B Chords (A Shape)',
      description: 'A-Shaped barre chords in the key of B.',
      chords: COMMON_CHORDS.filter((c) => c.chordName.startsWith('B,')),
    },
    {
      name: 'C Chords (A Shape)',
      description: 'A-Shaped barre chords in the key of C.',
      chords: COMMON_CHORDS.filter(
        (c) =>
          c.chordName.startsWith('C,') &&
          !['C,,,', 'C,,7,'].includes(c.chordName)
      ),
    },
    {
      name: 'G Chords (E Shape)',
      description: 'E-Shaped barre chords in the key of G.',
      chords: COMMON_CHORDS.filter(
        (c) =>
          c.chordName.startsWith('G,') &&
          !['G,,,', 'G,,7,'].includes(c.chordName)
      ),
    },
    {
      name: 'A Chords (Extended)',
      description: 'Extended chord voicings in the key of A.',
      chords: COMMON_CHORDS.filter(
        (c) =>
          c.chordName.startsWith('A,') &&
          !['A,,,', 'A,,7,', 'A,m,,', 'A,m,7,'].includes(c.chordName)
      ),
    },
    {
      name: 'E Chords (Extended)',
      description: 'Extended chord voicings in the key of E.',
      chords: COMMON_CHORDS.filter(
        (c) =>
          c.chordName.startsWith('E,') &&
          !['E,,,', 'E,,7,', 'E,m,,', 'E,m,7,'].includes(c.chordName)
      ),
    },
    {
      name: 'D Chords (Extended)',
      description: 'Extended chord voicings in the key of D.',
      chords: COMMON_CHORDS.filter(
        (c) =>
          c.chordName.startsWith('D,') &&
          !['D,,,', 'D,,7,', 'D,m,,', 'D,m,7,'].includes(c.chordName)
      ),
    },
  ];

  return categories.filter((cat) => cat.chords.length > 0);
}
