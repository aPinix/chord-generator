/** A tuning is six open-string MIDI notes, from the low (6th) string to the high (1st). */
export type TuningNotes = readonly [
  number,
  number,
  number,
  number,
  number,
  number,
];

export interface TuningPreset {
  id: string;
  name: string;
  notes: TuningNotes;
  /** Spell accidentals as flats (E♭) rather than sharps (D♯) */
  flats?: boolean;
}

export const STANDARD_TUNING: TuningNotes = [40, 45, 50, 55, 59, 64];

export const TUNING_PRESETS: readonly TuningPreset[] = [
  { id: 'standard', name: 'Standard', notes: STANDARD_TUNING },
  { id: 'drop-d', name: 'Drop D', notes: [38, 45, 50, 55, 59, 64] },
  {
    id: 'double-drop-d',
    name: 'Double drop D',
    notes: [38, 45, 50, 55, 59, 62],
  },
  { id: 'dadgad', name: 'DADGAD', notes: [38, 45, 50, 55, 57, 62] },
  { id: 'open-d', name: 'Open D', notes: [38, 45, 50, 54, 57, 62] },
  { id: 'open-e', name: 'Open E', notes: [40, 47, 52, 56, 59, 64] },
  { id: 'open-g', name: 'Open G', notes: [38, 43, 50, 55, 59, 62] },
  { id: 'open-a', name: 'Open A', notes: [40, 45, 52, 57, 61, 64] },
  { id: 'open-c', name: 'Open C', notes: [36, 43, 48, 55, 60, 64] },
  {
    id: 'half-step-down',
    name: 'Half step down',
    notes: [39, 44, 49, 54, 58, 63],
    flats: true,
  },
  {
    id: 'whole-step-down',
    name: 'Whole step down',
    notes: [38, 43, 48, 53, 57, 62],
  },
  { id: 'drop-c', name: 'Drop C', notes: [36, 43, 48, 53, 57, 62] },
];

/** How far a string may be retuned from standard, in semitones */
export const TUNING_RANGE = { down: -7, up: 4 } as const;

const SHARP_NAMES = [
  'C',
  'C♯',
  'D',
  'D♯',
  'E',
  'F',
  'F♯',
  'G',
  'G♯',
  'A',
  'A♯',
  'B',
];
const FLAT_NAMES = [
  'C',
  'D♭',
  'D',
  'E♭',
  'E',
  'F',
  'G♭',
  'G',
  'A♭',
  'A',
  'B♭',
  'B',
];

/** The name of a MIDI note without its octave, e.g. 61 → "C♯" */
export function noteName(midi: number, flats = false): string {
  const names = flats ? FLAT_NAMES : SHARP_NAMES;
  return names[((midi % 12) + 12) % 12];
}

export function isSameTuning(a: readonly number[], b: readonly number[]) {
  return a.length === b.length && a.every((note, i) => note === b[i]);
}

/** The preset matching these notes, if any */
export function findTuningPreset(
  notes: readonly number[]
): TuningPreset | undefined {
  return TUNING_PRESETS.find((preset) => isSameTuning(preset.notes, notes));
}

export function isStandardTuning(notes: readonly number[]) {
  return isSameTuning(notes, STANDARD_TUNING);
}

export function isValidTuning(value: unknown): value is TuningNotes {
  return (
    Array.isArray(value) &&
    value.length === 6 &&
    value.every(
      (note, i) =>
        Number.isInteger(note) &&
        note >= STANDARD_TUNING[i] + TUNING_RANGE.down &&
        note <= STANDARD_TUNING[i] + TUNING_RANGE.up
    )
  );
}
