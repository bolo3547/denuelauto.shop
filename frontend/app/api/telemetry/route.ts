const IS_STATIC_EXPORT = !!process.env.STATIC_EXPORT;

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Data file path
// for telemetry storage (demo)
const DATA_DIR = path.join(process.cwd(), 'data');
const TELEMETRY_FILE = path.join(DATA_DIR, 'telemetry.json');

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
  if (!fs.existsSync(TELEMETRY_FILE)) fs.writeFileSync(TELEMETRY_FILE, JSON.stringify([]));
}
function readtelemetry(): any[] {
  ensureDataFile();
  const str = fs.readFileSync(TELEMETRY_FILE, 'utf8');
  return JSON.parse(str || '[]');
}
function writetelemetry(items: any[]) {
  ensureDataFile();
  fs.writeFileSync(TELEMETRY_FILE, JSON.stringify(items, null, 2));
}

export async function POST(req: NextRequest) {
  if (IS_STATIC_EXPORT)
return NextResponse.json({ ok: false }, { status: 200 });
  try {
    const body = await req.json();
    // Basic validation
if (!body.vehicleId || !body.timestamp) {
      return NextResponse.json({ error: 'vehicleId and timestamp required' }, { status: 400 });
    }
const store = readtelemetry();
    store.push(body);
    writetelemetry(store);
    console.log('telemetry received:', body);
    return NextResponse.json({ ok: true, received: body }, { status: 201 });
  } catch (e) {
    console.error('telemetry POST error', e);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function GET() {
  if (IS_STATIC_EXPORT)
return NextResponse.json({ ok: false }, { status: 200 });const store = readtelemetry();
  return NextResponse.json({ telemetry: store }, { status: 200 });
}

export async function DELETE() {
  if (IS_STATIC_EXPORT)
return NextResponse.json({ ok: false }, { status: 200 });
  try {
    writetelemetry([]);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: 'Unable to clear telemetry' }, { status: 500 });
  }
}
