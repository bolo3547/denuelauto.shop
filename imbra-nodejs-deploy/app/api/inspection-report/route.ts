const IS_STATIC_EXPORT = !!process.env.STATIC_EXPORT;

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const INSPECT_FILE = path.join(DATA_DIR, 'inspectionReports.json');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(INSPECT_FILE)) fs.writeFileSync(INSPECT_FILE, JSON.stringify({}));

function readReports() {
  return JSON.parse(fs.readFileSync(INSPECT_FILE, 'utf8') || '{}');
}
function writeReports(obj: Record<string, string>) {
  fs.writeFileSync(INSPECT_FILE, JSON.stringify(obj, null, 2));
}

export async function GET(req: NextRequest) {
  if (IS_STATIC_EXPORT)
return NextResponse.json({ ok: false }, { status: 200 });const { searchParams } = new URL(req.url);
  const carId = searchParams.get('carId');
  const store = readReports();
  if (!carId)
return NextResponse.json({ map: store }, { status: 200 });
  return NextResponse.json({ carId, url: store[carId] }, { status: 200 });
}

export async function POST(req: NextRequest) {
  if (IS_STATIC_EXPORT)
return NextResponse.json({ ok: false }, { status: 200 });
  try {
    const body = await req.json();
    const carId = body?.carId;
    const url = body?.url;
    if (!carId || !url)
return NextResponse.json({ error: 'carId and url required' }, { status: 400 });
    const store = readReports();
    store[carId] = url;
    writeReports(store);
    return NextResponse.json({ carId, url }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  if (IS_STATIC_EXPORT)
return NextResponse.json({ ok: false }, { status: 200 });const { searchParams } = new URL(req.url);
  const carId = searchParams.get('carId');
  if (!carId)
return NextResponse.json({ error: 'carId required' }, { status: 400 });
  const store = readReports();
  delete store[carId];
  writeReports(store);
  return NextResponse.json({ ok: true }, { status: 200 });
}
