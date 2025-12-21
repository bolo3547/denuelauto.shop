import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../src/prismaClient';

// Require HQ admin JWT (cookie or Authorization header)
import jwt from 'jsonwebtoken';
const HQ_JWT_SECRET = process.env.HQ_JWT_SECRET || 'changeme_hq_secret';

export async function GET(req: NextRequest) {
  try {
    // Accept cookie or Authorization
    const authHeader = req.headers.get('authorization');
    const cookie = req.cookies.get('hq_admin_token')?.value;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : cookie;
    if (!token) return NextResponse.json({ error: 'Missing HQ admin token' }, { status: 401 });

    try {
      const payload = jwt.verify(token, HQ_JWT_SECRET) as any;
      // Verify admin exists and active
      const admin = await prisma.admin_users.findUnique({ where: { id: payload.adminId } });
      if (!admin || !admin.isActive) return NextResponse.json({ error: 'Invalid admin token' }, { status: 401 });
    } catch (err) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const proofs = await prisma.paymentProof.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
    return NextResponse.json({ items: proofs });
  } catch (err: any) {
    console.error('hq payment-proofs error', err);
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
}
