import { NextRequest, NextResponse } from 'next/server';

export async function POST(_: NextRequest) {
  return NextResponse.json({ error: 'Moved to API server' }, { status: 410 });
}

export const runtime = 'edge';
