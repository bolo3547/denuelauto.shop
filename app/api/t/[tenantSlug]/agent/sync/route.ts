import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/prismaClient';
import { getTenantBySlug } from '@/src/utils/tenant';
import { requireAgentAuth } from '@/src/middleware/auth';

export async function POST(req: NextRequest, { params }: { params: { tenantSlug: string } }) {
  const agent = await requireAgentAuth(req, params.tenantSlug);
  if (!agent) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const tenant = await getTenantBySlug(params.tenantSlug);
  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

  const body = await req.json();
  const actions: Array<{ id: string; type: string; payload: any; createdAt: number }> = body.actions ?? [];
  const results: Array<{ clientId: string; canonicalId?: string; status: 'OK' | 'SKIP' | 'ERROR' }> = [];

  for (const action of actions) {
    try {
      const existing = await prisma.agentActivityLog.findUnique({
        where: { tenantId_clientGeneratedId: { tenantId: tenant.id, clientGeneratedId: action.id } },
      });
      if (existing) {
        results.push({ clientId: action.id, status: 'SKIP', canonicalId: existing.canonicalId ?? undefined });
        continue;
      }

      let canonicalId: string | null = null;
      if (action.type === 'CREATE_LEAD') {
        const lead = await prisma.lead.create({
          data: { tenantId: tenant.id, source: 'AGENT', assignedAgentId: agent.id, status: 'NEW', ...action.payload },
        });
        canonicalId = lead.id;
      } else if (action.type === 'UPDATE_LEAD_STATUS') {
        await prisma.lead.update({
          where: { id: action.payload.id },
          data: { status: action.payload.status },
        });
        canonicalId = action.payload.id;
      } else if (action.type === 'ADD_LEAD_NOTE') {
        await prisma.leadHistory.create({
          data: {
            tenantId: tenant.id,
            leadId: action.payload.id,
            note: action.payload.note,
            actorType: 'AGENT',
            actorId: agent.id,
          },
        });
        canonicalId = action.payload.id;
      }

      await prisma.agentActivityLog.create({
        data: { tenantId: tenant.id, agentId: agent.id, clientGeneratedId: action.id, canonicalId, type: action.type, payload: action.payload },
      });

      results.push({ clientId: action.id, canonicalId: canonicalId ?? undefined, status: 'OK' });
    } catch (e) {
      results.push({ clientId: action.id, status: 'ERROR' });
    }
  }

  return NextResponse.json({ results });
}
