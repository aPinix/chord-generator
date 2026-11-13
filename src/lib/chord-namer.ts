/**
 * Names a chord from the notes it contains, so shapes outside the chord
 * library, and shapes in altered tunings, still get a name.
 */

// Conventional spellings for chord roots
const ROOT_NAMES = [
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
];

// Intervals above the root, in semitones. Earlier entries win a tie.
const QUALITIES: readonly (readonly [string, readonly number[]])[] = [
  ['', [0, 4, 7]],
  ['m', [0, 3, 7]],
  ['5', [0, 7]],
  ['7', [0, 4, 7, 10]],
  ['maj7', [0, 4, 7, 11]],
  ['m7', [0, 3, 7, 10]],
  ['sus4', [0, 5, 7]],
  ['sus2', [0, 2, 7]],
  ['6', [0, 4, 7, 9]],
  ['m6', [0, 3, 7, 9]],
  ['dim', [0, 3, 6]],
  ['aug', [0, 4, 8]],
  ['add9', [0, 2, 4, 7]],
  ['madd9', [0, 2, 3, 7]],
  ['7sus4', [0, 5, 7, 10]],
  ['9', [0, 2, 4, 7, 10]],
  ['maj9', [0, 2, 4, 7, 11]],
  ['m9', [0, 2, 3, 7, 10]],
  ['6/9', [0, 2, 4, 7, 9]],
  ['m7b5', [0, 3, 6, 10]],
  ['dim7', [0, 3, 6, 9]],
  ['mMaj7', [0, 3, 7, 11]],
  ['7#9', [0, 3, 4, 7, 10]],
  ['7b9', [0, 1, 4, 7, 10]],
  ['7#5', [0, 4, 8, 10]],
  ['7b5', [0, 4, 6, 10]],
  ['13', [0, 4, 7, 9, 10]],
  ['m11', [0, 3, 5, 7, 10]],
  ['11', [0, 2, 5, 7, 10]],
];

const sameSet = (a: ReadonlySet<number>, b: readonly number[]) =>
  a.size === b.length && b.every((value) => a.has(value));

/**
 * @param midiNotes the sounding notes, lowest string first
 * @returns a name such as "Am7" or "C/G", or null when nothing fits
 */
export function nameChordFromNotes(
  midiNotes: readonly number[]
): string | null {
  if (midiNotes.length < 2) return null;

  const bass = Math.min(...midiNotes) % 12;
  const pitchClasses = new Set(midiNotes.map((note) => note % 12));
  if (pitchClasses.size < 2) return null;

  let best: { name: string; score: number } | null = null;

  for (const root of pitchClasses) {
    const intervals = new Set(
      [...pitchClasses].map((pitch) => (pitch - root + 12) % 12)
    );

    QUALITIES.forEach(([suffix, formula], rank) => {
      const isExact = sameSet(intervals, formula);
      // Four-note chords and up are often played without the fifth
      const withoutFifth = formula.filter((interval) => interval !== 7);
      const isRootless5 =
        !isExact &&
        formula.length >= 4 &&
        withoutFifth.length < formula.length &&
        sameSet(intervals, withoutFifth);
      if (!isExact && !isRootless5) return;

      // Prefer the bass note as root, then a complete chord, then a simpler one
      const score = (root === bass ? 0 : 1000) + (isExact ? 0 : 100) + rank;
      if (best && best.score <= score) return;

      const name = `${ROOT_NAMES[root]}${suffix}`;
      best = {
        name: root === bass ? name : `${name}/${ROOT_NAMES[bass]}`,
        score,
      };
    });
  }

  return (best as { name: string } | null)?.name ?? null;
}
