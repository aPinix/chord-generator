import { detectChordName } from '@/lib/chord-data';
import { nameChordFromNotes } from '@/lib/chord-namer';
import {
  isStandardTuning,
  noteName,
  STANDARD_TUNING,
  type TuningNotes,
} from '@/lib/tunings';
import type { StringState } from '@/types/chord';

// Strings are kept high E first in the UI, tunings are low string first
const tuningIndex = (stringIndex: number) => 5 - stringIndex;

/** The MIDI note a string sounds at its current fret, or null when muted. */
export function getSoundingMidi(
  stringIndex: number,
  fret: StringState['fret'],
  tuning: TuningNotes = STANDARD_TUNING
): number | null {
  if (fret === 'X') return null;
  return tuning[tuningIndex(stringIndex)] + fret;
}

/** Sounding note names from the low string to the high string. */
export function getSoundingNotes(
  strings: StringState[],
  tuning: TuningNotes = STANDARD_TUNING,
  flats = false
): (string | null)[] {
  return strings
    .map((s, i) => {
      const midi = getSoundingMidi(i, s.fret, tuning);
      return midi === null ? null : noteName(midi, flats);
    })
    .reverse();
}

/** Open-string names in UI order (high string first). */
export function getStringNames(
  tuning: TuningNotes = STANDARD_TUNING,
  flats = false
): string[] {
  return [...tuning].reverse().map((midi) => noteName(midi, flats));
}

/** Fret numbers from the low string to the high string. */
export function getFretPattern(strings: StringState[]): string[] {
  return strings.map((s) => (s.fret === 'X' ? '×' : String(s.fret))).reverse();
}

/**
 * Name the chord on the fretboard. In standard tuning the chord library is
 * checked first, so its shapes keep their familiar names.
 */
export function detectChord(
  strings: StringState[],
  tuning: TuningNotes = STANDARD_TUNING
): string | null {
  if (isStandardTuning(tuning)) {
    // Six open strings are a starting point, not a chord worth naming
    if (strings.every((s) => s.fret === 0)) return null;

    const fromLibrary = detectChordName(strings);
    if (fromLibrary) return fromLibrary;
  }

  const sounding = strings
    .map((s, i) => getSoundingMidi(i, s.fret, tuning))
    .filter((midi): midi is number => midi !== null);
  return nameChordFromNotes(sounding);
}

/** Split a chord name into its root (with accidental) and the rest. */
export function splitChordName(name: string): { root: string; rest: string } {
  const match = /^([A-G][#b♯♭]?)(.*)$/.exec(name);
  if (!match) return { root: name, rest: '' };
  return { root: match[1], rest: match[2] };
}
