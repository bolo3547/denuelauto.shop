import { NextApiRequest, NextApiResponse } from 'next';
import { requireTenantRole, AuthenticatedRequest, logAgentActivity } from '../../../../../middleware/tenantAuth';
import prisma from '../../../../../prismaClient';
import { z } from 'zod';

const updateLeadSchema = z.object({
  customerName: z.string().min(1).optional(),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().optional(),
  source: z.enum(['WEBSITE', 'PHONE', 'EMAIL', 'SOCIAL_MEDIA', 'REFERRAL', 'WALK_IN', 'OTHER']).optional(),
  status: z.enum(['NEW', 'CONTACTED', 'INTERESTED', 'NOT_INTERESTED', 'CONVERTED', 'LOST']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  budget: z.number().min(0).optional(),
  interestedCarTypes: z.array(z.string()).optional(),
  notes: z.string().optional(),
  agentId: z.string().nullable().optional(),
  carId: z.string().nullable().optional(),
  expectedCloseDate: z.string().transform((str) => str ? new Date(str) : null).optional(),
  nextFollowUpAt: z.string().transform((str) => str ? new Date(str) : null).optional()
});

const assignLeadSchema = z.object({
  agentId: z.string().min(1, 'Agent ID is required'),
  reason: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  nextFollowUpAt: z.string().transform((str) => str ? new Date(str) : new Date(Date.now() + 24 * 60 * 60 * 1000)).optional()
});

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { method } = req;
  const { tenantId } = req.user!;
  const { leadId } = req.query;

  if (!leadId || typeof leadId !== 'string') {
    return res.status(400).json({ error: 'Lead ID is required' });
  }

  try {
    switch (method) {
      case 'GET':
        return await handleGetLead(req, res, tenantId, leadId);
      case 'PUT':
        return await handleUpdateLead(req, res, tenantId, leadId);
      case 'DELETE':
        return await handleDeleteLead(req, res, tenantId, leadId);
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('Lead API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGetLead(req: AuthenticatedRequest, res: NextApiResponse, tenantId: string, leadId: string) {
  const lead = await prisma.lead.findFirst({
    where: {
      id: leadId,
      tenantId
    },
    include: {
      agent: {
        select: { id: true, name: true, email: true, phone: true, role: true }
      },
      car: {
        select: { 
          id: true, make: true, model: true, year: true, 
          price: true, mileage: true, condition: true, images: true 
        }
      },
      createdByAgent: {
        select: { id: true, name: true, email: true }
      },
      appointments: {
        include: {
          agent: {
            select: { id: true, name: true }
          }
        },
        orderBy: { scheduledAt: 'desc' }
      },
      activityLogs: {
        include: {
          agent: {
            select: { id: true, name: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 50
      }
    }
  });

  if (!lead) {
    return res.status(404).json({ error: 'Lead not found' });
  }

  // Calculate lead timeline and insights
  const leadAge = Math.floor((Date.now() - lead.createdAt.getTime()) / (1000 * 60 * 60 * 24));
  const lastActivity = lead.activityLogs[0];
  const lastContactDays = lastActivity 
    ? Math.floor((Date.now() - lastActivity.createdAt.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // Get interaction summary
  const interactionSummary = lead.activityLogs.reduce((acc, log) => {
    acc[log.action] = (acc[log.action] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate engagement score (simple algorithm)
  const engagementScore = Math.min(100, Math.max(0, 
    (interactionSummary.LEAD_CONTACTED || 0) * 10 +
    (interactionSummary.APPOINTMENT_SCHEDULED || 0) * 20 +
    (interactionSummary.EMAIL_SENT || 0) * 5 +
    (lead.appointments.length) * 15 -
    (lastContactDays || 0) * 2
  ));

  return res.status(200).json({
    lead: {
      ...lead,
      insights: {
        leadAgeDays: leadAge,
        lastContactDays,
        engagementScore: Math.round(engagementScore),
        totalInteractions: lead.activityLogs.length,
        interactionBreakdown: interactionSummary,
        appointmentHistory: lead.appointments.length,
        conversionProbability: calculateConversionProbability(lead, leadAge, engagementScore)
      }
    }
  });
}

async function handleUpdateLead(req: AuthenticatedRequest, res: NextApiResponse, tenantId: string, leadId: string) {
  try {
    const validatedData = updateLeadSchema.parse(req.body);
    const { user } = req;

    // Check if lead exists and belongs to tenant
    const existingLead = await prisma.lead.findFirst({
      where: {
        id: leadId,
        tenantId
      }
    });

    if (!existingLead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    // If email is being updated, check for conflicts
    if (validatedData.customerEmail && validatedData.customerEmail !== existingLead.customerEmail) {
      const emailConflict = await prisma.lead.findFirst({
        where: {
          tenantId,
          customerEmail: validatedData.customerEmail,
          id: { not: leadId },
          status: { not: 'LOST' }
        }
      });

      if (emailConflict) {
        return res.status(400).json({ error: 'Email already in use by another active lead' });
      }
    }

    // If car is being updated, verify it belongs to tenant
    if (validatedData.carId) {
      const car = await prisma.car.findFirst({
        where: {
          id: validatedData.carId,
          tenantId
        }
      });

      if (!car) {
        return res.status(400).json({ error: 'Specified car not found' });
      }
    }

    // If agent is being updated, verify agent belongs to tenant and is active
    if (validatedData.agentId) {
      const agent = await prisma.agent.findFirst({
        where: {
          id: validatedData.agentId,
          tenantId,
          status: 'ACTIVE'
        }
      });

      if (!agent) {
        return res.status(400).json({ error: 'Specified agent not found or inactive' });
      }
    }

    // Track what changed for logging
    const changes: string[] = [];
    Object.keys(validatedData).forEach(key => {
      if (validatedData[key as keyof typeof validatedData] !== existingLead[key as keyof typeof existingLead]) {
        changes.push(key);
      }
    });

    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        ...validatedData,
        updatedAt: new Date(),
        ...(validatedData.agentId && validatedData.agentId !== existingLead.agentId && {
          assignedAt: new Date()
        })
      },
      include: {
        agent: {
          select: { id: true, name: true, email: true }
        },
        car: {
          select: { 
            id: true, make: true, model: true, year: true, 
            price: true, mileage: true 
          }
        }
      }
    });

    // Log the update
    const actionType = changes.includes('status') ? `LEAD_STATUS_CHANGED_${validatedData.status}` : 'LEAD_UPDATED';
    await logAgentActivity(
      tenantId,
      updatedLead.agentId || user!.id,
      actionType,
      `Lead updated: ${changes.join(', ')}`,
      leadId,
      { 
        changedFields: changes,
        updatedBy: user!.id,
        previousStatus: existingLead.status,
        newStatus: validatedData.status 
      }
    );

    // Special handling for status changes
    if (validatedData.status && validatedData.status !== existingLead.status) {
      await handleStatusChange(tenantId, leadId, existingLead.status, validatedData.status, user!.id);
    }

    // Special handling for agent assignment changes
    if (validatedData.agentId && validatedData.agentId !== existingLead.agentId) {
      await logAgentActivity(
        tenantId,
        validatedData.agentId,
        'LEAD_ASSIGNED',
        `Lead reassigned from ${existingLead.agentId || 'unassigned'} to ${validatedData.agentId}`,
        leadId,
        { 
          previousAgentId: existingLead.agentId,
          newAgentId: validatedData.agentId,
          assignedBy: user!.id 
        }
      );
    }

    return res.status(200).json({ lead: updatedLead });
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

async function handleDeleteLead(req: AuthenticatedRequest, res: NextApiResponse, tenantId: string, leadId: string) {
  // Check if lead exists and belongs to tenant
  const existingLead = await prisma.lead.findFirst({
    where: {
      id: leadId,
      tenantId
    },
    include: {
      _count: {
        select: { 
          appointments: { where: { status: 'SCHEDULED' } }
        }
      }
    }
  });

  if (!existingLead) {
    return res.status(404).json({ error: 'Lead not found' });
  }

  // Check if lead has upcoming appointments
  if (existingLead._count.appointments > 0) {
    return res.status(400).json({ 
      error: 'Cannot delete lead with upcoming appointments. Please cancel appointments first.',
      upcomingAppointments: existingLead._count.appointments
    });
  }

  // Soft delete the lead (set status to LOST with special flag)
  await prisma.lead.update({
    where: { id: leadId },
    data: {
      status: 'LOST',
      notes: `${existingLead.notes || ''}\n[DELETED: ${new Date().toISOString()}]`,
      updatedAt: new Date()
    }
  });

  // Log the deletion
  await logAgentActivity(
    tenantId,
    existingLead.agentId || req.user!.id,
    'LEAD_DELETED',
    `Lead deleted: ${existingLead.customerName}`,
    leadId,
    { 
      deletedBy: req.user!.id,
      customerEmail: existingLead.customerEmail,
      originalStatus: existingLead.status 
    }
  );

  return res.status(200).json({ 
    message: 'Lead deleted successfully',
    leadId 
  });
}

async function handleStatusChange(tenantId: string, leadId: string, oldStatus: string, newStatus: string, userId: string) {
  // TODO: Implement business logic for status changes
  // - Send notifications
  // - Update follow-up dates
  // - Create tasks
  // - Update metrics

  if (newStatus === 'CONVERTED') {
    // TODO: Create sale record, update agent performance metrics
    console.log(`Lead ${leadId} converted - implement sale creation logic`);
  } else if (newStatus === 'LOST') {
    // TODO: Cancel upcoming appointments, update loss reasons
    console.log(`Lead ${leadId} lost - implement cleanup logic`);
  }
}

function calculateConversionProbability(lead: any, leadAge: number, engagementScore: number): number {
  // Simple algorithm - in production you'd use ML models
  let probability = 50; // Base probability

  // Adjust for status
  const statusModifiers = {
    'NEW': -10,
    'CONTACTED': 0,
    'INTERESTED': +20,
    'NOT_INTERESTED': -30,
    'CONVERTED': 100,
    'LOST': 0
  };
  probability += statusModifiers[lead.status as keyof typeof statusModifiers] || 0;

  // Adjust for engagement
  probability += Math.min(30, engagementScore / 3);

  // Adjust for lead age (older leads less likely to convert)
  if (leadAge > 30) probability -= 20;
  else if (leadAge > 14) probability -= 10;

  // Adjust for budget
  if (lead.budget && lead.car?.price) {
    const budgetRatio = lead.budget / lead.car.price;
    if (budgetRatio >= 1.1) probability += 15;
    else if (budgetRatio >= 0.9) probability += 5;
    else if (budgetRatio < 0.7) probability -= 15;
  }

  return Math.max(0, Math.min(100, Math.round(probability)));
}

export default requireTenantRole(['ADMIN', 'MANAGER', 'AGENT'])(handler);