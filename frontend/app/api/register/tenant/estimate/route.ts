import { NextResponse } from 'next/server';

// Stub: estimate endpoint moved to backend
export async function POST() {
  return NextResponse.json({ ok: false, error: 'moved', message: 'This endpoint has moved to the backend API. Please call the backend server.' }, { status: 410 });
}
