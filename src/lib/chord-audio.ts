// Guitar string frequencies (open strings, low E to high E)
const OPEN_STRING_FREQUENCIES = [82.41, 110.0, 146.83, 196.0, 246.94, 329.63];

// Available types: 'sine' (cleanest), 'triangle' (warm), 'square' (buzzy), 'sawtooth' (bright/harsh)
const OSCILLATOR_TYPE: OscillatorType = 'triangle';

// Calculate frequency for a given string and fret
function getFrequency(stringIndex: number, fret: number): number {
  const openFreq = OPEN_STRING_FREQUENCIES[stringIndex];
  // Each fret is a semitone higher (multiply by 2^(1/12))
  return openFreq * 2 ** (fret / 12);
}

// Create a clean guitar-like tone using Web Audio API
function playTone(
  audioContext: AudioContext,
  frequency: number,
  startTime: number,
  duration: number = 1.5
): void {
  // Main oscillator
  const oscillator = audioContext.createOscillator();
  oscillator.type = OSCILLATOR_TYPE;
  oscillator.frequency.setValueAtTime(frequency, startTime);

  // Subtle second harmonic for slight warmth
  const oscillator2 = audioContext.createOscillator();
  oscillator2.type = OSCILLATOR_TYPE;
  oscillator2.frequency.setValueAtTime(frequency * 2, startTime);

  // Main gain
  const gainNode = audioContext.createGain();
  // Second harmonic gain (very subtle)
  const gainNode2 = audioContext.createGain();

  // Low-pass filter for smoother sound
  const filter = audioContext.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(2000, startTime);
  filter.Q.setValueAtTime(1, startTime);

  // Envelope: soft attack, smooth decay
  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(0.15, startTime + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  gainNode2.gain.setValueAtTime(0, startTime);
  gainNode2.gain.linearRampToValueAtTime(0.03, startTime + 0.02);
  gainNode2.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  // Connect: oscillators -> gains -> filter -> output
  oscillator.connect(gainNode);
  oscillator2.connect(gainNode2);
  gainNode.connect(filter);
  gainNode2.connect(filter);
  filter.connect(audioContext.destination);

  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
  oscillator2.start(startTime);
  oscillator2.stop(startTime + duration);
}

export type StringFret = number | 'X' | 0;

export interface PlayChordOptions {
  strumSpeed?: number; // milliseconds between each string
  duration?: number; // how long each note rings
}

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

// Play a chord given string/fret positions (low E to high E order)
export function playChord(
  strings: StringFret[],
  options: PlayChordOptions = {}
): void {
  const { strumSpeed = 50, duration = 2 } = options;
  const ctx = getAudioContext();

  // Resume audio context if suspended (browser autoplay policy)
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  const now = ctx.currentTime;

  // Play each string from low E (index 0) to high E (index 5)
  // strings array should be in low E to high E order
  strings.forEach((fret, stringIndex) => {
    // Skip muted strings (X)
    if (fret === 'X') return;

    const frequency = getFrequency(stringIndex, fret as number);
    const startTime = now + (stringIndex * strumSpeed) / 1000;
    playTone(ctx, frequency, startTime, duration);
  });
}

// Convert UI string order (high E to low E) to audio order (low E to high E)
export function uiStringsToAudioStrings(uiStrings: StringFret[]): StringFret[] {
  return [...uiStrings].reverse();
}
