import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { url } = await req.json();
    
    const response = await fetch(url);
    const blob = await response.blob();
    const buffer = await blob.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': 'attachment; filename="panel.png"',
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Failed to download image' },
      { status: 500 }
    );
  }
} 