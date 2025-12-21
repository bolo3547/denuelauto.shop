const IS_STATIC_EXPORT = !!process.env.STATIC_EXPORT;

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// store map of vin -> verified (demo persistence)
const DATA_DIR = path.join(process.cwd(), 'data');
const VERIFY_FILE = path.join(DATA_DIR, 'verifiedOwners.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(VERIFY_FILE)) fs.writeFileSync(VERIFY_FILE, JSON.stringify({}));

function readVerified() {
  return JSON.parse(fs.readFileSync(VERIFY_FILE, 'utf8') || '{}');
}
function writeVerified(obj: Record<string, boolean>) {
  fs.writeFileSync(VERIFY_FILE, JSON.stringify(obj, null, 2));
}

export async function POST(req: NextRequest) {
  if (IS_STATIC_EXPORT)
return NextResponse.json({ ok: false }, { status: 200 });
  try {
    const body = await req.json();
    const vin = body?.vin;
    if (!vin)
return NextResponse.json({ error: 'vin required' }, { status: 400 });
    const verified = !!body.setVerified ? true : !!body.verified;
    const store = readVerified();
    if (typeof body.setVerified !== 'undefined') {
      store[vin] = !!body.setVerified;
      writeVerified(store);
    }
return NextResponse.json({ vin, verified: store[vin] === true }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  if (IS_STATIC_EXPORT)
return NextResponse.json({ ok: false }, { status: 200 });
  try {
    const { searchParams } = new URL(req.url);
    const vin = searchParams.get('vin');
    const store = readVerified();
    if (!vin)
return NextResponse.json({ verifiedMap: store }, { status: 200 });
    return NextResponse.json({ vin, verified: !!store[vin] }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
