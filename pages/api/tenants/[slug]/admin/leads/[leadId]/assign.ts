import { NextApiRequest, NextApiResponse } from 'next';
import { requireTenantRole, AuthenticatedRequest, logAgentActivity } from '../../../../../../middleware/tenantAuth';
import prisma from '../../../../../../prismaClient';
import { z } from 'zod';
import { notifyAgent, NotificationTemplates } from '../../../../../../notifications';

const assignLeadSchema = z.object({
  agentId: z.string().min(1, 'Agent ID is required'),
  reason: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  nextFollowUpAt: z.string().transform((str) => 
    str ? new Date(str) : new Date(Date.now() + 24 * 60 * 60 * 1000)
  ).optional()
});

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tenantId, user } = req;
  const { leadId } = req.query;

  if (!leadId || typeof leadId !== 'string') {
    return res.status(400).json({ error: 'Lead ID is required' });
  }

  try {
    const validatedData = assignLeadSchema.parse(req.body);

    // Verify lead exists and belongs to tenant
    const existingLead = await prisma.lead.findFirst({
      where: {
        id: leadId,
        tenantId: tenantId!
      },
      include: {
        agent: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!existingLead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    // Verify agent exists, belongs to tenant, and is active
    const agent = await prisma.agent.findFirst({
      where: {
        id: validatedData.agentId,
        tenantId: tenantId!,
        status: 'ACTIVE'
      },
      include: {
        _count: {
          select: { 
            assignedLeads: { 
              where: { status: { in: ['NEW', 'CONTACTED', 'INTERESTED'] } } 
            }
          }
        }
      }
    });

    if (!agent) {
      return res.status(400).json({ error: 'Agent not found or inactive' });
    }

    // Check agent's current workload
    if (agent._count.assignedLeads >= agent.maxLeadsPerDay) {
      return res.status(400).json({ 
        error: `Agent has reached maximum daily lead capacity (${agent.maxLeadsPerDay})`,
        currentLeadCount: agent._count.assignedLeads,
        maxLeadCapacity: agent.maxLeadsPerDay
      });
    }

    // Check if lead is already assigned to the same agent
    if (existingLead.agentId === validatedData.agentId) {
      return res.status(400).json({ error: 'Lead is already assigned to this agent' });
    }

    // Perform the assignment
    const updateData: any = {
      agentId: validatedData.agentId,
      assignedAt: new Date(),
      updatedAt: new Date()
    };

    if (validatedData.priority) {
      updateData.priority = validatedData.priority;
    }

    if (validatedData.nextFollowUpAt) {
      updateData.nextFollowUpAt = validatedData.nextFollowUpAt;
    }

    // If lead is NEW, move it to CONTACTED status
    if (existingLead.status === 'NEW') {
      updateData.status = 'CONTACTED';
    }

    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: updateData,
      include: {
        agent: {
          select: { id: true, name: true, email: true, role: true }
        },
        car: {
          select: { 
            id: true, make: true, model: true, year: true, price: true 
          }
        },
        createdByAgent: {
          select: { id: true, name: true }
        }
      }
    });

    // Log the assignment activity
    await logAgentActivity(
      tenantId!,
      validatedData.agentId,
      'LEAD_ASSIGNED',
      `Lead assigned: ${existingLead.customerName} (${validatedData.reason || 'Manual assignment'})`,
      leadId,
      {
        previousAgentId: existingLead.agentId,
        previousAgentName: existingLead.agent?.name,
        newAgentId: validatedData.agentId,
        newAgentName: agent.name,
        assignedBy: user!.id,
        assignedByEmail: user!.email,
        reason: validatedData.reason,
        priority: validatedData.priority,
        agentCurrentWorkload: agent._count.assignedLeads + 1
      }
    );

    // Log activity for previous agent if there was one
    if (existingLead.agentId && existingLead.agentId !== validatedData.agentId) {
      await logAgentActivity(
        tenantId!,
        existingLead.agentId,
        'LEAD_UNASSIGNED',
        `Lead reassigned away: ${existingLead.customerName}`,
        leadId,
        {
          reassignedTo: validatedData.agentId,
          reassignedToName: agent.name,
          reason: validatedData.reason,
          reassignedBy: user!.id
        }
      );
    }

    // Send notification to new agent
    const assignNotification = NotificationTemplates.leadAssigned(
      existingLead.customerName,
      agent.name
    );
    await notifyAgent(tenantId!, validatedData.agentId, assignNotification.title, assignNotification.message, {
      leadId,
      priority: validatedData.priority,
    });

    // Send notification to previous agent if applicable
    if (existingLead.agentId && existingLead.agentId !== validatedData.agentId) {
      const reassignNotification = NotificationTemplates.leadReassigned(
        existingLead.customerName,
        existingLead.agent?.name || 'Previous Agent',
        agent.name
      );
      await notifyAgent(tenantId!, existingLead.agentId, reassignNotification.title, reassignNotification.message, {
        leadId,
        reason: validatedData.reason,
      });
    }

    // Create follow-up task based on nextFollowUpAt
    if (validatedData.nextFollowUpAt) {
      await prisma.lead.update({
        where: { id: leadId },
        data: { nextFollowUpAt: validatedData.nextFollowUpAt },
      });
    }

    return res.status(200).json({
      message: 'Lead assigned successfully',
      lead: updatedLead,
      assignment: {
        previousAgent: existingLead.agent,
        newAgent: {
          id: agent.id,
          name: agent.name,
          email: agent.email,
          currentWorkload: agent._count.assignedLeads + 1,
          maxCapacity: agent.maxLeadsPerDay
        },
        assignedBy: {
          id: user!.id,
          email: user!.email
        },
        assignedAt: updateData.assignedAt,
        reason: validatedData.reason
      }
    });
  } catch (error) {
    console.error('Lead assignment error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default requireTenantRole(['ADMIN', 'MANAGER'])(handler);