import type { ChordData } from '@/types/chord';

export const COMMON_CHORDS: ChordData[] = [
  // A chords
  { chordName: 'A,,,', strings: 'X 0 2 2 2 0', fingering: 'X X 2 1 3 X' },
  { chordName: 'A,m,,', strings: 'X 0 2 2 1 0', fingering: 'X X 2 3 1 X' },
  { chordName: 'A,,7,', strings: 'X 0 2 0 2 0', fingering: 'X X 2 X 3 X' },
  { chordName: 'A,m,,7,', strings: 'X 0 2 0 1 0', fingering: 'X X 2 X 1 X' },
  { chordName: 'A,maj,7,', strings: 'X 0 2 1 2 0', fingering: 'X X 2 1 3 X' },
  { chordName: 'A,,6,', strings: 'X 0 2 2 2 2', fingering: 'X X 1 1 1 1' },
  { chordName: 'A,m,,6,', strings: 'X 0 2 2 1 2', fingering: 'X X 2 3 1 4' },
  { chordName: 'A,,9,', strings: 'X 0 2 4 2 3', fingering: 'X X 1 3 1 2' },
  { chordName: 'A,m,,9,', strings: 'X 0 2 4 1 0', fingering: 'X X 1 4 2 X' },
  { chordName: 'A,add,9,', strings: 'X 0 2 2 0 0', fingering: 'X X 2 3 X X' },
  { chordName: 'A,sus,2,', strings: 'X 0 2 2 0 0', fingering: 'X X 2 3 X X' },
  { chordName: 'A,sus,4,', strings: 'X 0 2 2 3 0', fingering: 'X X 1 2 3 X' },
  { chordName: 'A,,7sus4,', strings: 'X 0 2 0 3 0', fingering: 'X X 1 X 2 X' },
  { chordName: 'A,,11,', strings: 'X 0 0 0 2 0', fingering: 'X X X X 1 X' },
  { chordName: 'A,,13,', strings: 'X 0 2 0 2 2', fingering: 'X X 2 X 3 4' },
  { chordName: 'A,,5,', strings: 'X 0 2 2 X X', fingering: 'X X 1 2 X X' },
  { chordName: 'A,dim,,', strings: 'X 0 1 2 1 X', fingering: 'X X 1 3 2 X' },
  { chordName: 'A,dim,,7,', strings: 'X 0 1 2 1 2', fingering: 'X X 1 3 2 4' },
  { chordName: 'A,aug,,', strings: 'X 0 3 2 2 1', fingering: 'X X 4 2 3 1' },
  // A# / Bb chords
  { chordName: 'A#,,,', strings: 'X 1 3 3 3 1', fingering: 'X 1 2 3 4 1' },
  { chordName: 'A#,m,,', strings: 'X 1 3 3 2 1', fingering: 'X 1 3 4 2 1' },
  { chordName: 'A#,,7,', strings: 'X 1 3 1 3 1', fingering: 'X 1 3 1 4 1' },
  { chordName: 'A#,m,,7,', strings: 'X 1 3 1 2 1', fingering: 'X 1 3 1 2 1' },
  { chordName: 'A#,maj,7,', strings: 'X 1 3 2 3 1', fingering: 'X 1 3 2 4 1' },
  { chordName: 'A#,,6,', strings: 'X 1 3 3 3 3', fingering: 'X 1 2 2 2 2' },
  { chordName: 'A#,m,,6,', strings: 'X 1 3 3 2 3', fingering: 'X 1 3 4 2 4' },
  { chordName: 'A#,,9,', strings: 'X 1 0 1 1 1', fingering: 'X 1 X 2 2 2' },
  { chordName: 'A#,sus,2,', strings: 'X 1 3 3 1 1', fingering: 'X 1 3 4 1 1' },
  { chordName: 'A#,sus,4,', strings: 'X 1 3 3 4 1', fingering: 'X 1 2 3 4 1' },
  { chordName: 'A#,,7sus4,', strings: 'X 1 3 1 4 1', fingering: 'X 1 3 1 4 1' },
  { chordName: 'A#,,5,', strings: 'X 1 3 3 X X', fingering: 'X 1 3 4 X X' },
  { chordName: 'A#,dim,,', strings: 'X 1 2 3 2 X', fingering: 'X 1 2 4 3 X' },
  { chordName: 'A#,aug,,', strings: 'X 1 4 3 3 2', fingering: 'X 1 4 2 3 1' },
  // B chords
  { chordName: 'B,,,', strings: 'X 2 4 4 4 2', fingering: 'X 1 2 3 4 1' },
  { chordName: 'B,m,,', strings: 'X 2 4 4 3 2', fingering: 'X 1 3 4 2 1' },
  { chordName: 'B,,7,', strings: 'X 2 1 2 0 2', fingering: 'X 2 1 3 X 4' },
  { chordName: 'B,m,,7,', strings: 'X 2 0 2 0 2', fingering: 'X 1 X 2 X 3' },
  { chordName: 'B,maj,7,', strings: 'X 2 4 3 4 2', fingering: 'X 1 3 2 4 1' },
  { chordName: 'B,,6,', strings: 'X 2 4 4 4 4', fingering: 'X 1 2 2 2 2' },
  { chordName: 'B,m,,6,', strings: 'X 2 4 4 3 4', fingering: 'X 1 3 4 2 4' },
  { chordName: 'B,,9,', strings: 'X 2 1 2 2 2', fingering: 'X 2 1 3 3 3' },
  { chordName: 'B,m,,9,', strings: 'X 2 0 2 2 2', fingering: 'X 2 X 3 3 3' },
  { chordName: 'B,add,9,', strings: 'X 2 4 4 2 2', fingering: 'X 1 3 4 1 1' },
  { chordName: 'B,sus,2,', strings: 'X 2 4 4 2 2', fingering: 'X 1 3 4 1 1' },
  { chordName: 'B,sus,4,', strings: 'X 2 4 4 5 2', fingering: 'X 1 2 3 4 1' },
  { chordName: 'B,,7sus4,', strings: 'X 2 4 2 5 2', fingering: 'X 1 3 1 4 1' },
  { chordName: 'B,,11,', strings: 'X 2 2 2 4 2', fingering: 'X 1 1 1 3 1' },
  { chordName: 'B,,5,', strings: 'X 2 4 4 X X', fingering: 'X 1 3 4 X X' },
  { chordName: 'B,dim,,', strings: 'X 2 3 4 3 X', fingering: 'X 1 2 4 3 X' },
  { chordName: 'B,dim,,7,', strings: 'X 2 3 1 3 X', fingering: 'X 2 3 1 4 X' },
  { chordName: 'B,aug,,', strings: 'X 2 5 4 4 3', fingering: 'X 1 4 2 3 1' },
  // C chords
  { chordName: 'C,,,', strings: 'X 3 2 0 1 0', fingering: 'X 3 2 X 1 X' },
  { chordName: 'C,m,,', strings: 'X 3 5 5 4 3', fingering: 'X 1 3 4 2 1' },
  { chordName: 'C,,7,', strings: 'X 3 2 3 1 0', fingering: 'X 3 2 4 1 X' },
  { chordName: 'C,m,,7,', strings: 'X 3 5 3 4 3', fingering: 'X 1 3 1 2 1' },
  { chordName: 'C,maj,7,', strings: 'X 3 2 0 0 0', fingering: 'X 3 2 X X X' },
  { chordName: 'C,,6,', strings: 'X 3 2 2 1 0', fingering: 'X 4 2 3 1 X' },
  { chordName: 'C,m,,6,', strings: 'X 3 1 2 1 3', fingering: 'X 3 1 2 1 4' },
  { chordName: 'C,,9,', strings: 'X 3 2 3 3 3', fingering: 'X 2 1 3 3 3' },
  { chordName: 'C,m,,9,', strings: 'X 3 1 3 3 3', fingering: 'X 2 1 3 3 3' },
  { chordName: 'C,add,9,', strings: 'X 3 2 0 3 0', fingering: 'X 2 1 X 3 X' },
  { chordName: 'C,sus,2,', strings: 'X 3 0 0 1 0', fingering: 'X 3 X X 1 X' },
  { chordName: 'C,sus,4,', strings: 'X 3 3 0 1 1', fingering: 'X 3 4 X 1 1' },
  { chordName: 'C,,7sus4,', strings: 'X 3 3 3 1 1', fingering: 'X 2 3 4 1 1' },
  { chordName: 'C,,11,', strings: 'X 3 3 3 5 3', fingering: 'X 1 1 1 3 1' },
  { chordName: 'C,,13,', strings: 'X 3 2 3 3 5', fingering: 'X 2 1 3 3 4' },
  { chordName: 'C,,5,', strings: 'X 3 5 5 X X', fingering: 'X 1 3 4 X X' },
  { chordName: 'C,dim,,', strings: 'X 3 4 5 4 X', fingering: 'X 1 2 4 3 X' },
  { chordName: 'C,dim,,7,', strings: 'X 3 4 2 4 X', fingering: 'X 2 3 1 4 X' },
  { chordName: 'C,aug,,', strings: 'X 3 2 1 1 0', fingering: 'X 4 3 1 2 X' },
  // C# / Db chords
  { chordName: 'C#,,,', strings: 'X 4 6 6 6 4', fingering: 'X 1 2 3 4 1' },
  { chordName: 'C#,m,,', strings: 'X 4 6 6 5 4', fingering: 'X 1 3 4 2 1' },
  { chordName: 'C#,,7,', strings: 'X 4 6 4 6 4', fingering: 'X 1 3 1 4 1' },
  { chordName: 'C#,m,,7,', strings: 'X 4 6 4 5 4', fingering: 'X 1 3 1 2 1' },
  { chordName: 'C#,maj,7,', strings: 'X 4 6 5 6 4', fingering: 'X 1 3 2 4 1' },
  { chordName: 'C#,,6,', strings: 'X 4 6 6 6 6', fingering: 'X 1 2 2 2 2' },
  { chordName: 'C#,m,,6,', strings: 'X 4 6 6 5 6', fingering: 'X 1 3 4 2 4' },
  { chordName: 'C#,,9,', strings: 'X 4 3 4 4 4', fingering: 'X 2 1 3 3 3' },
  { chordName: 'C#,sus,2,', strings: 'X 4 6 6 4 4', fingering: 'X 1 3 4 1 1' },
  { chordName: 'C#,sus,4,', strings: 'X 4 6 6 7 4', fingering: 'X 1 2 3 4 1' },
  { chordName: 'C#,,7sus4,', strings: 'X 4 6 4 7 4', fingering: 'X 1 3 1 4 1' },
  { chordName: 'C#,,5,', strings: 'X 4 6 6 X X', fingering: 'X 1 3 4 X X' },
  { chordName: 'C#,dim,,', strings: 'X 4 5 6 5 X', fingering: 'X 1 2 4 3 X' },
  { chordName: 'C#,aug,,', strings: 'X 4 3 2 2 1', fingering: 'X 4 3 1 2 1' },
  // D chords
  { chordName: 'D,,,', strings: 'X X 0 2 3 2', fingering: 'X X X 1 3 2' },
  { chordName: 'D,m,,', strings: 'X X 0 2 3 1', fingering: 'X X X 2 3 1' },
  { chordName: 'D,,7,', strings: 'X X 0 2 1 2', fingering: 'X X X 2 1 3' },
  { chordName: 'D,m,,7,', strings: 'X X 0 2 1 1', fingering: 'X X X 2 1 1' },
  { chordName: 'D,maj,7,', strings: 'X X 0 2 2 2', fingering: 'X X X 1 1 1' },
  { chordName: 'D,,6,', strings: 'X X 0 2 0 2', fingering: 'X X X 1 X 2' },
  { chordName: 'D,m,,6,', strings: 'X X 0 2 0 1', fingering: 'X X X 2 X 1' },
  { chordName: 'D,,9,', strings: 'X X 0 2 1 0', fingering: 'X X X 2 1 X' },
  { chordName: 'D,m,,9,', strings: 'X X 0 2 1 0', fingering: 'X X X 2 1 X' },
  { chordName: 'D,add,9,', strings: 'X X 0 2 3 0', fingering: 'X X X 1 3 X' },
  { chordName: 'D,sus,2,', strings: 'X X 0 2 3 0', fingering: 'X X X 1 3 X' },
  { chordName: 'D,sus,4,', strings: 'X X 0 2 3 3', fingering: 'X X X 1 2 3' },
  { chordName: 'D,,7sus4,', strings: 'X X 0 2 1 3', fingering: 'X X X 2 1 4' },
  { chordName: 'D,,11,', strings: 'X X 0 0 1 0', fingering: 'X X X X 1 X' },
  { chordName: 'D,,13,', strings: 'X X 0 2 1 2', fingering: 'X X X 2 1 3' },
  { chordName: 'D,,5,', strings: 'X X 0 2 3 X', fingering: 'X X X 1 2 X' },
  { chordName: 'D,dim,,', strings: 'X X 0 1 3 1', fingering: 'X X X 1 3 2' },
  { chordName: 'D,dim,,7,', strings: 'X X 0 1 0 1', fingering: 'X X X 1 X 2' },
  { chordName: 'D,aug,,', strings: 'X X 0 3 3 2', fingering: 'X X X 2 3 1' },
  // D# / Eb chords
  { chordName: 'D#,,,', strings: 'X 6 8 8 8 6', fingering: 'X 1 2 3 4 1' },
  { chordName: 'D#,m,,', strings: 'X 6 8 8 7 6', fingering: 'X 1 3 4 2 1' },
  { chordName: 'D#,,7,', strings: 'X 6 8 6 8 6', fingering: 'X 1 3 1 4 1' },
  { chordName: 'D#,m,,7,', strings: 'X 6 8 6 7 6', fingering: 'X 1 3 1 2 1' },
  { chordName: 'D#,maj,7,', strings: 'X 6 8 7 8 6', fingering: 'X 1 3 2 4 1' },
  { chordName: 'D#,,6,', strings: 'X 6 8 8 8 8', fingering: 'X 1 2 2 2 2' },
  { chordName: 'D#,m,,6,', strings: 'X 6 8 8 7 8', fingering: 'X 1 3 4 2 4' },
  { chordName: 'D#,,9,', strings: 'X 6 5 6 6 6', fingering: 'X 2 1 3 3 3' },
  { chordName: 'D#,sus,2,', strings: 'X 6 8 8 6 6', fingering: 'X 1 3 4 1 1' },
  { chordName: 'D#,sus,4,', strings: 'X 6 8 8 9 6', fingering: 'X 1 2 3 4 1' },
  { chordName: 'D#,,7sus4,', strings: 'X 6 8 6 9 6', fingering: 'X 1 3 1 4 1' },
  { chordName: 'D#,,5,', strings: 'X 6 8 8 X X', fingering: 'X 1 3 4 X X' },
  { chordName: 'D#,dim,,', strings: 'X 6 7 8 7 X', fingering: 'X 1 2 4 3 X' },
  { chordName: 'D#,aug,,', strings: 'X 6 5 4 4 3', fingering: 'X 4 3 1 2 1' },
  // E chords
  { chordName: 'E,,,', strings: '0 2 2 1 0 0', fingering: 'X 2 3 1 X X' },
  { chordName: 'E,m,,', strings: '0 2 2 0 0 0', fingering: 'X 2 3 X X X' },
  { chordName: 'E,,7,', strings: '0 2 0 1 0 0', fingering: 'X 2 X 1 X X' },
  { chordName: 'E,m,,7,', strings: '0 2 0 0 0 0', fingering: 'X 2 X X X X' },
  { chordName: 'E,maj,7,', strings: '0 2 1 1 0 0', fingering: 'X 3 1 2 X X' },
  { chordName: 'E,,6,', strings: '0 2 2 1 2 0', fingering: 'X 2 3 1 4 X' },
  { chordName: 'E,m,,6,', strings: '0 2 2 0 2 0', fingering: 'X 2 3 X 4 X' },
  { chordName: 'E,,9,', strings: '0 2 0 1 0 2', fingering: 'X 2 X 1 X 3' },
  { chordName: 'E,m,,9,', strings: '0 2 0 0 0 2', fingering: 'X 2 X X X 4' },
  { chordName: 'E,add,9,', strings: '0 2 2 1 0 2', fingering: 'X 2 3 1 X 4' },
  { chordName: 'E,sus,2,', strings: '0 2 4 4 0 0', fingering: 'X 1 3 4 X X' },
  { chordName: 'E,sus,4,', strings: '0 2 2 2 0 0', fingering: 'X 2 3 4 X X' },
  { chordName: 'E,,7sus4,', strings: '0 2 0 2 0 0', fingering: 'X 2 X 3 X X' },
  { chordName: 'E,,11,', strings: '0 0 0 1 0 0', fingering: 'X X X 1 X X' },
  { chordName: 'E,,13,', strings: '0 2 0 1 2 0', fingering: 'X 2 X 1 3 X' },
  { chordName: 'E,,5,', strings: '0 2 2 X X X', fingering: 'X 1 2 X X X' },
  { chordName: 'E,dim,,', strings: '0 1 2 0 X X', fingering: 'X 1 2 X X X' },
  { chordName: 'E,dim,,7,', strings: '0 1 2 0 2 0', fingering: 'X 1 3 X 4 X' },
  { chordName: 'E,aug,,', strings: '0 3 2 1 1 0', fingering: 'X 4 3 1 2 X' },
  // F chords
  { chordName: 'F,,,', strings: '1 3 3 2 1 1', fingering: '1 3 4 2 1 1' },
  { chordName: 'F,m,,', strings: '1 3 3 1 1 1', fingering: '1 3 4 1 1 1' },
  { chordName: 'F,,7,', strings: '1 3 1 2 1 1', fingering: '1 3 1 2 1 1' },
  { chordName: 'F,m,,7,', strings: '1 3 1 1 1 1', fingering: '1 3 1 1 1 1' },
  { chordName: 'F,maj,7,', strings: '1 X 2 2 1 0', fingering: '1 X 3 4 2 X' },
  { chordName: 'F,,6,', strings: '1 3 3 2 3 1', fingering: '1 3 4 2 4 1' },
  { chordName: 'F,m,,6,', strings: '1 3 3 1 3 1', fingering: '1 3 4 1 4 1' },
  { chordName: 'F,,9,', strings: '1 3 1 2 1 3', fingering: '1 3 1 2 1 4' },
  { chordName: 'F,m,,9,', strings: '1 3 1 1 1 3', fingering: '1 3 1 1 1 4' },
  { chordName: 'F,add,9,', strings: '1 0 3 2 1 1', fingering: '1 X 4 3 1 1' },
  { chordName: 'F,sus,2,', strings: '1 3 3 0 1 1', fingering: '1 3 4 X 1 1' },
  { chordName: 'F,sus,4,', strings: '1 3 3 3 1 1', fingering: '1 2 3 4 1 1' },
  { chordName: 'F,,7sus4,', strings: '1 3 1 3 1 1', fingering: '1 3 1 4 1 1' },
  { chordName: 'F,,11,', strings: '1 1 1 2 1 1', fingering: '1 1 1 2 1 1' },
  { chordName: 'F,,13,', strings: '1 3 1 2 3 1', fingering: '1 3 1 2 4 1' },
  { chordName: 'F,,5,', strings: '1 3 3 X X X', fingering: '1 3 4 X X X' },
  { chordName: 'F,dim,,', strings: '1 2 3 1 X X', fingering: '1 2 4 1 X X' },
  { chordName: 'F,dim,,7,', strings: '1 2 3 1 3 X', fingering: '1 2 4 1 3 X' },
  { chordName: 'F,aug,,', strings: '1 X 3 2 2 1', fingering: '1 X 4 2 3 1' },
  // F# / Gb chords
  { chordName: 'F#,,,', strings: '2 4 4 3 2 2', fingering: '1 3 4 2 1 1' },
  { chordName: 'F#,m,,', strings: '2 4 4 2 2 2', fingering: '1 3 4 1 1 1' },
  { chordName: 'F#,,7,', strings: '2 4 2 3 2 2', fingering: '1 3 1 2 1 1' },
  { chordName: 'F#,m,,7,', strings: '2 4 2 2 2 2', fingering: '1 3 1 1 1 1' },
  { chordName: 'F#,maj,7,', strings: '2 X 3 3 2 1', fingering: '1 X 3 4 2 1' },
  { chordName: 'F#,,6,', strings: '2 4 4 3 4 2', fingering: '1 3 4 2 4 1' },
  { chordName: 'F#,m,,6,', strings: '2 4 4 2 4 2', fingering: '1 3 4 1 4 1' },
  { chordName: 'F#,,9,', strings: '2 4 2 3 2 4', fingering: '1 3 1 2 1 4' },
  { chordName: 'F#,m,,9,', strings: '2 4 2 2 2 4', fingering: '1 3 1 1 1 4' },
  { chordName: 'F#,add,9,', strings: '2 4 4 3 2 4', fingering: '1 3 4 2 1 4' },
  { chordName: 'F#,sus,2,', strings: '2 4 4 1 2 2', fingering: '1 3 4 1 1 1' },
  { chordName: 'F#,sus,4,', strings: '2 4 4 4 2 2', fingering: '1 2 3 4 1 1' },
  { chordName: 'F#,,7sus4,', strings: '2 4 2 4 2 2', fingering: '1 3 1 4 1 1' },
  { chordName: 'F#,,5,', strings: '2 4 4 X X X', fingering: '1 3 4 X X X' },
  { chordName: 'F#,dim,,', strings: '2 3 4 2 X X', fingering: '1 2 4 1 X X' },
  { chordName: 'F#,dim,,7,', strings: '2 3 4 2 4 X', fingering: '1 2 4 1 3 X' },
  { chordName: 'F#,aug,,', strings: '2 X 4 3 3 2', fingering: '1 X 4 2 3 1' },
  // G chords
  { chordName: 'G,,,', strings: '3 2 0 0 0 3', fingering: '2 1 X X X 3' },
  { chordName: 'G,m,,', strings: '3 5 5 3 3 3', fingering: '1 3 4 1 1 1' },
  { chordName: 'G,,7,', strings: '3 2 0 0 0 1', fingering: '3 2 X X X 1' },
  { chordName: 'G,m,,7,', strings: '3 5 3 3 3 3', fingering: '1 3 1 1 1 1' },
  { chordName: 'G,maj,7,', strings: '3 2 0 0 0 2', fingering: '2 1 X X X 3' },
  { chordName: 'G,,6,', strings: '3 2 0 0 0 0', fingering: '2 1 X X X X' },
  { chordName: 'G,m,,6,', strings: '3 5 5 3 5 3', fingering: '1 3 4 1 4 1' },
  { chordName: 'G,,9,', strings: '3 X 0 2 0 1', fingering: '3 X X 2 X 1' },
  { chordName: 'G,m,,9,', strings: '3 5 3 3 3 5', fingering: '1 3 1 1 1 4' },
  { chordName: 'G,add,9,', strings: '3 0 0 0 0 3', fingering: '2 X X X X 3' },
  { chordName: 'G,sus,2,', strings: '3 0 0 0 3 3', fingering: '1 X X X 3 4' },
  { chordName: 'G,sus,4,', strings: '3 5 5 5 3 3', fingering: '1 2 3 4 1 1' },
  { chordName: 'G,,7sus4,', strings: '3 5 3 5 3 3', fingering: '1 3 1 4 1 1' },
  { chordName: 'G,,11,', strings: '3 3 0 0 1 1', fingering: '2 3 X X 1 1' },
  { chordName: 'G,,13,', strings: '3 2 0 0 0 0', fingering: '2 1 X X X X' },
  { chordName: 'G,,5,', strings: '3 5 5 X X X', fingering: '1 3 4 X X X' },
  { chordName: 'G,dim,,', strings: '3 4 5 3 X X', fingering: '1 2 4 1 X X' },
  { chordName: 'G,dim,,7,', strings: '3 4 5 3 5 X', fingering: '1 2 4 1 3 X' },
  { chordName: 'G,aug,,', strings: '3 X 5 4 4 3', fingering: '1 X 4 2 3 1' },
  // G# / Ab chords
  { chordName: 'G#,,,', strings: '4 6 6 5 4 4', fingering: '1 3 4 2 1 1' },
  { chordName: 'G#,m,,', strings: '4 6 6 4 4 4', fingering: '1 3 4 1 1 1' },
  { chordName: 'G#,,7,', strings: '4 6 4 5 4 4', fingering: '1 3 1 2 1 1' },
  { chordName: 'G#,m,,7,', strings: '4 6 4 4 4 4', fingering: '1 3 1 1 1 1' },
  { chordName: 'G#,maj,7,', strings: '4 X 5 5 4 3', fingering: '1 X 3 4 2 1' },
  { chordName: 'G#,,6,', strings: '4 6 6 5 6 4', fingering: '1 3 4 2 4 1' },
  { chordName: 'G#,m,,6,', strings: '4 6 6 4 6 4', fingering: '1 3 4 1 4 1' },
  { chordName: 'G#,,9,', strings: '4 6 4 5 4 6', fingering: '1 3 1 2 1 4' },
  { chordName: 'G#,m,,9,', strings: '4 6 4 4 4 6', fingering: '1 3 1 1 1 4' },
  { chordName: 'G#,add,9,', strings: '4 6 6 5 4 6', fingering: '1 3 4 2 1 4' },
  { chordName: 'G#,sus,2,', strings: '4 6 6 3 4 4', fingering: '1 3 4 1 1 1' },
  { chordName: 'G#,sus,4,', strings: '4 6 6 6 4 4', fingering: '1 2 3 4 1 1' },
  { chordName: 'G#,,7sus4,', strings: '4 6 4 6 4 4', fingering: '1 3 1 4 1 1' },
  { chordName: 'G#,,5,', strings: '4 6 6 X X X', fingering: '1 3 4 X X X' },
  { chordName: 'G#,dim,,', strings: '4 5 6 4 X X', fingering: '1 2 4 1 X X' },
  { chordName: 'G#,dim,,7,', strings: '4 5 6 4 6 X', fingering: '1 2 4 1 3 X' },
  { chordName: 'G#,aug,,', strings: '4 X 6 5 5 4', fingering: '1 X 4 2 3 1' },
  // Flat enharmonic equivalents (Bb, Db, Eb, Gb, Ab)
  { chordName: 'Bb,,,', strings: 'X 1 3 3 3 1', fingering: 'X 1 2 3 4 1' },
  { chordName: 'Bb,m,,', strings: 'X 1 3 3 2 1', fingering: 'X 1 3 4 2 1' },
  { chordName: 'Bb,,7,', strings: 'X 1 3 1 3 1', fingering: 'X 1 3 1 4 1' },
  { chordName: 'Bb,maj,7,', strings: 'X 1 3 2 3 1', fingering: 'X 1 3 2 4 1' },
  { chordName: 'Db,,,', strings: 'X 4 6 6 6 4', fingering: 'X 1 2 3 4 1' },
  { chordName: 'Db,m,,', strings: 'X 4 6 6 5 4', fingering: 'X 1 3 4 2 1' },
  { chordName: 'Db,,7,', strings: 'X 4 6 4 6 4', fingering: 'X 1 3 1 4 1' },
  { chordName: 'Db,maj,7,', strings: 'X 4 6 5 6 4', fingering: 'X 1 3 2 4 1' },
  { chordName: 'Eb,,,', strings: 'X 6 8 8 8 6', fingering: 'X 1 2 3 4 1' },
  { chordName: 'Eb,m,,', strings: 'X 6 8 8 7 6', fingering: 'X 1 3 4 2 1' },
  { chordName: 'Eb,,7,', strings: 'X 6 8 6 8 6', fingering: 'X 1 3 1 4 1' },
  { chordName: 'Eb,maj,7,', strings: 'X 6 8 7 8 6', fingering: 'X 1 3 2 4 1' },
  { chordName: 'Gb,,,', strings: '2 4 4 3 2 2', fingering: '1 3 4 2 1 1' },
  { chordName: 'Gb,m,,', strings: '2 4 4 2 2 2', fingering: '1 3 4 1 1 1' },
  { chordName: 'Gb,,7,', strings: '2 4 2 3 2 2', fingering: '1 3 1 2 1 1' },
  { chordName: 'Gb,maj,7,', strings: '2 X 3 3 2 1', fingering: '1 X 3 4 2 1' },
  { chordName: 'Ab,,,', strings: '4 6 6 5 4 4', fingering: '1 3 4 2 1 1' },
  { chordName: 'Ab,m,,', strings: '4 6 6 4 4 4', fingering: '1 3 4 1 1 1' },
  { chordName: 'Ab,,7,', strings: '4 6 4 5 4 4', fingering: '1 3 1 2 1 1' },
  { chordName: 'Ab,maj,7,', strings: '4 X 5 5 4 3', fingering: '1 X 3 4 2 1' },
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
