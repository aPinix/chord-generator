import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chordName = searchParams.get('name');
  const nameLike = searchParams.get('nameLike');

  if (!chordName && !nameLike) {
    return NextResponse.json(
      { error: 'Missing chord name parameter' },
      { status: 400 }
    );
  }

  try {
    let url: string;

    if (nameLike) {
      url = `https://api.uberchord.com/v1/chords?nameLike=${encodeURIComponent(nameLike)}`;
    } else if (chordName) {
      const formattedName = chordName.replace(/,/g, '_');
      url = `https://api.uberchord.com/v1/chords/${encodeURIComponent(formattedName)}`;
    } else {
      return NextResponse.json(
        { error: 'Missing chord name parameter' },
        { status: 400 }
      );
    }

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Chord not found' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching chord:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chord data' },
      { status: 500 }
    );
  }
}
