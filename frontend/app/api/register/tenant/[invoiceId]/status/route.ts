import { NextResponse } from 'next/server';

export async function generateStaticParams() { return []; }

export async function GET() {
  return NextResponse.json({ ok: false, error: 'moved', message: 'This endpoint has moved to the backend API. Please call the backend server.' }, { status: 410 });
}
