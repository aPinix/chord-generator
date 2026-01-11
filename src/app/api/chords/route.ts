import { NextResponse } from 'next/server';
import { COMMON_CHORDS, searchChords } from '@/lib/chord-data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chordName = searchParams.get('name');
  const nameLike = searchParams.get('nameLike');

  if (!chordName && !nameLike) {
    return NextResponse.json(COMMON_CHORDS);
  }

  const query = nameLike || chordName || '';
  const results = searchChords(query);

  if (results.length === 0) {
    return NextResponse.json({ error: 'Chord not found' }, { status: 404 });
  }

  return NextResponse.json(results);
}
