import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/prismaClient';
import jwt from 'jsonwebtoken';
import { approvePaymentProof, rejectPaymentProof } from '@/src/services/paymentProofs.service';

const HQ_JWT_SECRET = process.env.HQ_JWT_SECRET || 'changeme_hq_secret';

// Require HQ auth middleware
async function requireHQAuth(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cookie = req.cookies.get('hq_admin_token')?.value;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : cookie;
  if (!token) throw new Error('Missing HQ admin token');
  const payload = jwt.verify(token, HQ_JWT_SECRET) as any;
  const admin = await prisma.admin_users.findUnique({ where: { id: payload.adminId } });
  if (!admin || !admin.isActive) throw new Error('Invalid admin token');
  return admin;
}

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const proof = await prisma.paymentProof.findUnique({ where: { id: params.id } });
  if (!proof) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(proof);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // require HQ auth
    const admin = await requireHQAuth(req);
    const body = await req.json();
    const action = String(body.action || '').toLowerCase();
    if (!['approve', 'reject'].includes(action)) return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    if (action === 'approve') {
      await approvePaymentProof(params.id, { id: admin.id, type: 'hq_admin' });
      return NextResponse.json({ status: 'APPROVED', invoicePaid: true });
    } else {
      const reason = String(body.reason || '');
      await rejectPaymentProof(params.id, { id: admin.id, type: 'hq_admin' }, reason);
      return NextResponse.json({ status: 'REJECTED', rejectionReason: reason });
    }
  } catch (err: any) {
    console.error('hq payment-proofs [id] patch error', err);
    if (err.message && err.message.includes('Missing HQ')) return NextResponse.json({ error: err.message }, { status: 401 });
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
}
