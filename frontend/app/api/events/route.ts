const IS_STATIC_EXPORT = !!process.env.STATIC_EXPORT;

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  if (IS_STATIC_EXPORT)
return NextResponse.json({ ok: false }, { status: 200 });
  try {
    const body = await req.json();
    // quick server-side logging; replace with event bus or analytics provider
    console.log('[Telemetry] event:', JSON.stringify(body));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Telemetry POST error', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
