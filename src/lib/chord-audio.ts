// MIDI notes of the open strings, low string to high string.
// Standard tuning: E2=40, A2=45, D3=50, G3=55, B3=59, E4=64
let openStringMidi: number[] = [40, 45, 50, 55, 59, 64];

/** Retune the guitar. Notes run from the low string to the high string. */
export function setTuning(notes: readonly number[]): void {
  openStringMidi = [...notes];
}

// Note names for MIDI numbers
const NOTE_NAMES = [
  'C',
  'Db',
  'D',
  'Eb',
  'E',
  'F',
  'Gb',
  'G',
  'Ab',
  'A',
  'Bb',
  'B',
];

// Available guitar types
export const GUITAR_TYPES = {
  acoustic_guitar_nylon: 'Nylon Acoustic',
  acoustic_guitar_steel: 'Steel Acoustic',
  electric_guitar_jazz: 'Jazz Electric',
  electric_guitar_clean: 'Clean Electric',
  electric_guitar_muted: 'Muted Electric',
  overdriven_guitar: 'Overdriven',
  distortion_guitar: 'Distortion',
  guitar_harmonics: 'Harmonics',
} as const;

export type GuitarType = keyof typeof GUITAR_TYPES;

// Soundfont base URL
const SOUNDFONT_BASE = 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM';

// Current guitar type (default: nylon acoustic)
let currentGuitarType: GuitarType = 'acoustic_guitar_nylon';
let guitarTypeInitialized = false;

// Initialize guitar type from localStorage (client-side only)
function initGuitarType(): void {
  if (guitarTypeInitialized) return;
  guitarTypeInitialized = true;
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('chord-diagram-guitar');
    if (saved && saved in GUITAR_TYPES) {
      currentGuitarType = saved as GuitarType;
    }
  }
}

export function getGuitarType(): GuitarType {
  initGuitarType();
  return currentGuitarType;
}

export function setGuitarType(type: GuitarType): void {
  initGuitarType();
  if (type !== currentGuitarType) {
    currentGuitarType = type;
    // Clear cache when guitar type changes to load new samples
    audioBufferCache.clear();
    loadingPromises.clear();
  }
}

function getSoundfontUrl(): string {
  return `${SOUNDFONT_BASE}/${currentGuitarType}-mp3`;
}

// Cache for loaded audio buffers
const audioBufferCache = new Map<string, AudioBuffer>();
const loadingPromises = new Map<string, Promise<AudioBuffer | null>>();

// Convert MIDI note number to note name (e.g., 40 -> "E2")
function midiToNoteName(midi: number): string {
  const octave = Math.floor(midi / 12) - 1;
  const note = NOTE_NAMES[midi % 12];
  return `${note}${octave}`;
}

// Get MIDI note for a string and fret
function getMidiNote(
  stringIndex: number,
  fret: number,
  tuning: readonly number[] = openStringMidi
): number {
  return tuning[stringIndex] + fret;
}

// Load a single note sample
async function loadNote(
  noteName: string,
  ctx: AudioContext
): Promise<AudioBuffer | null> {
  // Check cache first
  const cached = audioBufferCache.get(noteName);
  if (cached) return cached;

  // Check if already loading
  const loading = loadingPromises.get(noteName);
  if (loading) return loading;

  // Start loading
  const loadPromise = (async () => {
    try {
      const response = await fetch(`${getSoundfontUrl()}/${noteName}.mp3`);
      if (!response.ok) return null;
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      audioBufferCache.set(noteName, audioBuffer);
      return audioBuffer;
    } catch {
      console.warn(`Failed to load note: ${noteName}`);
      return null;
    }
  })();

  loadingPromises.set(noteName, loadPromise);
  return loadPromise;
}

// Play a single note from the soundfont
async function playNote(
  ctx: AudioContext,
  midiNote: number,
  startTime: number,
  duration: number = 2
): Promise<void> {
  const noteName = midiToNoteName(midiNote);
  const buffer = await loadNote(noteName, ctx);

  if (!buffer) return;

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(0.7, startTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

  source.connect(gainNode);
  gainNode.connect(ctx.destination);

  source.start(startTime);
  source.stop(startTime + duration);
}

export type StringFret = number | 'X' | 0;

export interface PlayChordOptions {
  strumSpeed?: number; // milliseconds between each string
  duration?: number; // how long each note rings
  /** Play in this tuning (low string first) instead of the guitar's current one */
  tuning?: readonly number[];
}

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

// Preload common guitar notes for faster playback
export async function preloadGuitarSounds(): Promise<void> {
  const ctx = getAudioContext();
  // Preload notes from fret 0-12 for all strings
  const notesToLoad: string[] = [];
  for (let string = 0; string < 6; string++) {
    for (let fret = 0; fret <= 12; fret++) {
      const midi = getMidiNote(string, fret);
      notesToLoad.push(midiToNoteName(midi));
    }
  }
  // Remove duplicates
  const uniqueNotes = [...new Set(notesToLoad)];
  await Promise.all(uniqueNotes.map((note) => loadNote(note, ctx)));
}

// Play a chord given string/fret positions (low E to high E order)
export function playChord(
  strings: StringFret[],
  options: PlayChordOptions = {}
): void {
  const { strumSpeed = 50, duration = 2, tuning } = options;
  const ctx = getAudioContext();

  // Resume audio context if suspended (browser autoplay policy)
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  const now = ctx.currentTime;

  // Play each string from low E (index 0) to high E (index 5)
  strings.forEach((fret, stringIndex) => {
    // Skip muted strings (X)
    if (fret === 'X') return;

    const midiNote = getMidiNote(stringIndex, fret as number, tuning);
    const startTime = now + (stringIndex * strumSpeed) / 1000;
    playNote(ctx, midiNote, startTime, duration);
  });
}

// Convert UI string order (high E to low E) to audio order (low E to high E)
export function uiStringsToAudioStrings(uiStrings: StringFret[]): StringFret[] {
  return [...uiStrings].reverse();
}

// One voice per string: plucking a string again cuts off its previous note
const stringVoices = new Map<
  number,
  { source: AudioBufferSourceNode; gain: GainNode }
>();

/** Load the samples a chord needs, so the first pluck is not late. */
export function preloadChord(strings: StringFret[]): void {
  const ctx = getAudioContext();
  strings.forEach((fret, stringIndex) => {
    if (fret === 'X') return;
    loadNote(midiToNoteName(getMidiNote(stringIndex, fret as number)), ctx);
  });
}

/**
 * Pluck a single string (0 = low string).
 * @param velocity loudness from 0 to 1
 * @param delay seconds from now, used to spread a fast strum
 */
export async function pluckString(
  stringIndex: number,
  fret: StringFret,
  velocity = 0.8,
  delay = 0
): Promise<void> {
  if (fret === 'X') return;

  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  const requestedAt = ctx.currentTime;
  const buffer = await loadNote(
    midiToNoteName(getMidiNote(stringIndex, fret as number)),
    ctx
  );
  if (!buffer) return;

  const startTime = Math.max(ctx.currentTime, requestedAt + delay);

  const previous = stringVoices.get(stringIndex);
  if (previous) {
    previous.gain.gain.cancelScheduledValues(startTime);
    previous.gain.gain.setTargetAtTime(0, startTime, 0.012);
    previous.source.stop(startTime + 0.1);
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(Math.min(Math.max(velocity, 0.05), 1), startTime);
  gain.gain.exponentialRampToValueAtTime(0.01, startTime + 3);

  source.connect(gain);
  gain.connect(ctx.destination);
  source.start(startTime);
  source.stop(startTime + 3);

  stringVoices.set(stringIndex, { source, gain });
}
