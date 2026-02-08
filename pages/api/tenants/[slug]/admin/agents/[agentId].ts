import { NextApiRequest, NextApiResponse } from 'next';
import { requireTenantRole, AuthenticatedRequest, logAgentActivity, autoAssignLead } from '../../../../../middleware/tenantAuth';
import prisma from '../../../../../prismaClient';
import { z } from 'zod';
import { notifyAgent, NotificationTemplates } from '../../../../../notifications';

const updateAgentSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().optional(),
  skills: z.array(z.string()).optional(),
  maxLeadsPerDay: z.number().min(1).max(100).optional(),
  workingHours: z.object({
    monday: z.object({ start: z.string(), end: z.string() }).optional(),
    tuesday: z.object({ start: z.string(), end: z.string() }).optional(),
    wednesday: z.object({ start: z.string(), end: z.string() }).optional(),
    thursday: z.object({ start: z.string(), end: z.string() }).optional(),
    friday: z.object({ start: z.string(), end: z.string() }).optional(),
    saturday: z.object({ start: z.string(), end: z.string() }).optional(),
    sunday: z.object({ start: z.string(), end: z.string() }).optional(),
  }).optional(),
  portalAccess: z.boolean().optional(),
  role: z.enum(['AGENT', 'SENIOR_AGENT', 'TEAM_LEAD']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional()
});

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { method } = req;
  const { tenantId } = req.user!;
  const { agentId } = req.query;

  if (!agentId || typeof agentId !== 'string') {
    return res.status(400).json({ error: 'Agent ID is required' });
  }

  try {
    switch (method) {
      case 'GET':
        return await handleGetAgent(req, res, tenantId, agentId);
      case 'PUT':
        return await handleUpdateAgent(req, res, tenantId, agentId);
      case 'DELETE':
        return await handleDeleteAgent(req, res, tenantId, agentId);
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('Agent API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGetAgent(req: AuthenticatedRequest, res: NextApiResponse, tenantId: string, agentId: string) {
  const agent = await prisma.agent.findFirst({
    where: {
      id: agentId,
      tenantId
    },
    include: {
      assignedLeads: {
        where: { status: { not: 'CONVERTED' } },
        include: {
          car: {
            select: { make: true, model: true, year: true, price: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      },
      activityLogs: {
        include: {
          lead: {
            select: { customerName: true, customerEmail: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 20
      },
      _count: {
        select: { 
          assignedLeads: { where: { status: { in: ['NEW', 'CONTACTED', 'INTERESTED'] } } },
          createdLeads: true 
        }
      }
    }
  });

  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }

  // Calculate detailed performance metrics
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    monthlyConversions,
    weeklyConversions,
    monthlyAssignments,
    weeklyAssignments,
    avgResponseTime,
    appointmentsScheduled
  ] = await Promise.all([
    prisma.lead.count({
      where: {
        agentId,
        status: 'CONVERTED',
        updatedAt: { gte: thirtyDaysAgo }
      }
    }),
    prisma.lead.count({
      where: {
        agentId,
        status: 'CONVERTED',
        updatedAt: { gte: sevenDaysAgo }
      }
    }),
    prisma.lead.count({
      where: {
        agentId,
        assignedAt: { gte: thirtyDaysAgo }
      }
    }),
    prisma.lead.count({
      where: {
        agentId,
        assignedAt: { gte: sevenDaysAgo }
      }
    }),
    // Calculate average response time from activity logs
    // Measure time between LEAD_ASSIGNED and first LEAD_CONTACTED for each lead
    prisma.agentActivityLog.findMany({
      where: {
        agentId,
        action: { in: ['LEAD_ASSIGNED', 'LEAD_CONTACTED'] },
        createdAt: { gte: thirtyDaysAgo },
      },
      orderBy: { createdAt: 'asc' },
      select: { action: true, createdAt: true, leadId: true },
    }),
    prisma.appointment.count({
      where: {
        agentId,
        scheduledAt: { gte: thirtyDaysAgo }
      }
    })
  ]);

  const monthlyConversionRate = monthlyAssignments > 0 ? (monthlyConversions / monthlyAssignments) * 100 : 0;
  const weeklyConversionRate = weeklyAssignments > 0 ? (weeklyConversions / weeklyAssignments) * 100 : 0;

  // Calculate average response time from activity logs
  const responseTimeLogs = avgResponseTime as Array<{ action: string; createdAt: Date; leadId: string | null }>;
  let totalResponseMinutes = 0;
  let responseCount = 0;
  const assignedTimes: Record<string, Date> = {};

  for (const log of responseTimeLogs) {
    if (!log.leadId) continue;
    if (log.action === 'LEAD_ASSIGNED') {
      assignedTimes[log.leadId] = log.createdAt;
    } else if (log.action === 'LEAD_CONTACTED' && assignedTimes[log.leadId]) {
      const diffMinutes = (log.createdAt.getTime() - assignedTimes[log.leadId].getTime()) / (1000 * 60);
      const THIRTY_DAYS_IN_MINUTES = 30 * 24 * 60; // 43200 minutes
      if (diffMinutes >= 0 && diffMinutes < THIRTY_DAYS_IN_MINUTES) {
        totalResponseMinutes += diffMinutes;
        responseCount++;
      }
      delete assignedTimes[log.leadId]; // Only count first response
    }
  }

  const calculatedAvgResponseMinutes = responseCount > 0
    ? Math.round(totalResponseMinutes / responseCount)
    : 0;

  return res.status(200).json({
    agent: {
      ...agent,
      performanceMetrics: {
        monthly: {
          conversions: monthlyConversions,
          assignments: monthlyAssignments,
          conversionRate: Math.round(monthlyConversionRate * 100) / 100,
          appointmentsScheduled
        },
        weekly: {
          conversions: weeklyConversions,
          assignments: weeklyAssignments,
          conversionRate: Math.round(weeklyConversionRate * 100) / 100
        },
        responseMetrics: {
          avgResponseTimeMinutes: calculatedAvgResponseMinutes,
          totalContacts: responseCount
        }
      }
    }
  });
}

async function handleUpdateAgent(req: AuthenticatedRequest, res: NextApiResponse, tenantId: string, agentId: string) {
  try {
    const validatedData = updateAgentSchema.parse(req.body);

    // Check if agent exists and belongs to tenant
    const existingAgent = await prisma.agent.findFirst({
      where: {
        id: agentId,
        tenantId
      }
    });

    if (!existingAgent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    // If email is being updated, check for conflicts
    if (validatedData.email && validatedData.email !== existingAgent.email) {
      const emailConflict = await prisma.agent.findFirst({
        where: {
          tenantId,
          email: validatedData.email,
          id: { not: agentId }
        }
      });

      if (emailConflict) {
        return res.status(400).json({ error: 'Email already in use by another agent' });
      }
    }

    const updatedAgent = await prisma.agent.update({
      where: { id: agentId },
      data: {
        ...validatedData,
        updatedAt: new Date()
      },
      include: {
        _count: {
          select: { 
            assignedLeads: { where: { status: { in: ['NEW', 'CONTACTED', 'INTERESTED'] } } },
            createdLeads: true 
          }
        }
      }
    });

    // Log the update
    await logAgentActivity(
      tenantId,
      agentId,
      'AGENT_UPDATED',
      `Agent profile updated`,
      undefined,
      { updatedFields: Object.keys(validatedData), updatedBy: req.user!.id }
    );

    // If status changed to INACTIVE, reassign active leads
    if (validatedData.status === 'INACTIVE' && existingAgent.status === 'ACTIVE') {
      // Auto-reassign active leads to other agents
      const activeLeads = await prisma.lead.findMany({
        where: {
          agentId,
          status: { in: ['NEW', 'CONTACTED', 'INTERESTED'] }
        }
      });

      if (activeLeads.length > 0) {
        // Find available agents to reassign to (round-robin)
        const availableAgents = await prisma.agent.findMany({
          where: {
            tenantId,
            status: 'ACTIVE',
            id: { not: agentId },
          },
          include: {
            _count: {
              select: { assignedLeads: { where: { status: { in: ['NEW', 'CONTACTED', 'INTERESTED'] } } } },
            },
          },
          orderBy: { updatedAt: 'asc' },
        });

        // Reassign leads round-robin to available agents
        for (let i = 0; i < activeLeads.length; i++) {
          const lead = activeLeads[i];
          if (availableAgents.length > 0) {
            const targetAgent = availableAgents[i % availableAgents.length];
            await prisma.lead.update({
              where: { id: lead.id },
              data: { agentId: targetAgent.id, assignedAt: new Date() },
            });

            // Notify the new agent
            const notification = NotificationTemplates.leadReassigned(
              lead.customerName,
              existingAgent.name,
              targetAgent.name
            );
            await notifyAgent(tenantId, targetAgent.id, notification.title, notification.message, {
              leadId: lead.id,
              reason: 'AGENT_DEACTIVATED',
            });
          } else {
            // No available agents - unassign the lead
            await prisma.lead.update({
              where: { id: lead.id },
              data: { agentId: null },
            });
          }
        }

        await logAgentActivity(
          tenantId,
          agentId,
          'LEADS_REASSIGNED',
          `${activeLeads.length} leads reassigned due to agent deactivation`,
          undefined,
          {
            leadCount: activeLeads.length,
            reason: 'AGENT_DEACTIVATED',
            reassignedToAgents: availableAgents.map(a => a.id),
          }
        );
      }
    }

    return res.status(200).json({ agent: updatedAgent });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    throw error;
  }
}

async function handleDeleteAgent(req: AuthenticatedRequest, res: NextApiResponse, tenantId: string, agentId: string) {
  // Check if agent exists and belongs to tenant
  const existingAgent = await prisma.agent.findFirst({
    where: {
      id: agentId,
      tenantId
    },
    include: {
      _count: {
        select: { 
          assignedLeads: { where: { status: { in: ['NEW', 'CONTACTED', 'INTERESTED'] } } }
        }
      }
    }
  });

  if (!existingAgent) {
    return res.status(404).json({ error: 'Agent not found' });
  }

  // Check if agent has active leads
  if (existingAgent._count.assignedLeads > 0) {
    return res.status(400).json({ 
      error: 'Cannot delete agent with active leads. Please reassign leads first.',
      activeLeadsCount: existingAgent._count.assignedLeads
    });
  }

  // Soft delete the agent (set status to INACTIVE)
  await prisma.agent.update({
    where: { id: agentId },
    data: {
      status: 'INACTIVE',
      email: `deleted_${Date.now()}_${existingAgent.email}`, // Prevent email conflicts
      updatedAt: new Date()
    }
  });

  // Log the deletion
  await logAgentActivity(
    tenantId,
    agentId,
    'AGENT_DELETED',
    `Agent profile deleted: ${existingAgent.name}`,
    undefined,
    { deletedBy: req.user!.id, originalEmail: existingAgent.email }
  );

  return res.status(200).json({ 
    message: 'Agent deleted successfully',
    agentId 
  });
}

export default requireTenantRole(['ADMIN', 'MANAGER'])(handler);