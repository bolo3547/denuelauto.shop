import { NextApiRequest, NextApiResponse } from 'next';
import { requireTenantRole, AuthenticatedRequest, logAgentActivity, autoAssignLead } from '../../../../middleware/tenantAuth';
import prisma from '../../../../prismaClient';
import { z } from 'zod';
import { notifyAgent, NotificationTemplates } from '../../../../notifications';

// Validation schemas
const createLeadSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  customerEmail: z.string().email('Invalid email format'),
  customerPhone: z.string().optional(),
  source: z.enum(['WEBSITE', 'PHONE', 'EMAIL', 'SOCIAL_MEDIA', 'REFERRAL', 'WALK_IN', 'OTHER']).default('WEBSITE'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  budget: z.number().min(0).optional(),
  interestedCarTypes: z.array(z.string()).default([]),
  notes: z.string().optional(),
  agentId: z.string().optional(), // Optional - can be auto-assigned
  carId: z.string().optional(),
  expectedCloseDate: z.string().transform((str) => str ? new Date(str) : undefined).optional()
});

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

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { method } = req;
  const { tenantId } = req.user!;

  try {
    switch (method) {
      case 'GET':
        return await handleGetLeads(req, res, tenantId);
      case 'POST':
        return await handleCreateLead(req, res, tenantId);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('Leads API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGetLeads(req: AuthenticatedRequest, res: NextApiResponse, tenantId: string) {
  const { 
    page = '1', 
    limit = '10', 
    search = '', 
    status = 'all',
    priority = 'all',
    agentId = 'all',
    source = 'all',
    sortBy = 'createdAt',
    sortOrder = 'desc',
    dateFrom,
    dateTo
  } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const offset = (pageNum - 1) * limitNum;

  // Build filter conditions
  const where: any = { tenantId };
  
  if (search) {
    where.OR = [
      { customerName: { contains: search as string, mode: 'insensitive' } },
      { customerEmail: { contains: search as string, mode: 'insensitive' } },
      { customerPhone: { contains: search as string, mode: 'insensitive' } },
      { notes: { contains: search as string, mode: 'insensitive' } }
    ];
  }

  if (status !== 'all') {
    where.status = status;
  }

  if (priority !== 'all') {
    where.priority = priority;
  }

  if (agentId !== 'all') {
    if (agentId === 'unassigned') {
      where.agentId = null;
    } else {
      where.agentId = agentId;
    }
  }

  if (source !== 'all') {
    where.source = source;
  }

  // Date filtering
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) {
      where.createdAt.gte = new Date(dateFrom as string);
    }
    if (dateTo) {
      where.createdAt.lte = new Date(dateTo as string);
    }
  }

  // Build sort conditions
  const orderBy: any = {};
  if (sortBy === 'agent') {
    orderBy.agent = { name: sortOrder };
  } else if (sortBy === 'car') {
    orderBy.car = { make: sortOrder };
  } else {
    orderBy[sortBy as string] = sortOrder;
  }

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      include: {
        agent: {
          select: { id: true, name: true, email: true, role: true }
        },
        car: {
          select: { 
            id: true, make: true, model: true, year: true, 
            price: true, mileage: true, condition: true 
          }
        },
        createdByAgent: {
          select: { id: true, name: true }
        },
        _count: {
          select: { 
            appointments: true
          }
        }
      },
      orderBy,
      skip: offset,
      take: limitNum
    }),
    prisma.lead.count({ where })
  ]);

  // Get additional metrics for each lead
  const leadsWithMetrics = await Promise.all(
    leads.map(async (lead) => {
      const [lastActivity, appointmentsCount] = await Promise.all([
        prisma.agentActivityLog.findFirst({
          where: { leadId: lead.id },
          orderBy: { createdAt: 'desc' },
          select: { action: true, createdAt: true, description: true }
        }),
        prisma.appointment.count({
          where: { leadId: lead.id, status: 'SCHEDULED' }
        })
      ]);

      // Calculate lead age and time since last contact
      const leadAge = Math.floor((Date.now() - lead.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      const lastContactDays = lastActivity 
        ? Math.floor((Date.now() - lastActivity.createdAt.getTime()) / (1000 * 60 * 60 * 24))
        : null;

      return {
        ...lead,
        metrics: {
          leadAgeDays: leadAge,
          lastContactDays,
          upcomingAppointments: appointmentsCount,
          lastActivity
        }
      };
    })
  );

  return res.status(200).json({
    leads: leadsWithMetrics,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    }
  });
}

async function handleCreateLead(req: AuthenticatedRequest, res: NextApiResponse, tenantId: string) {
  try {
    const validatedData = createLeadSchema.parse(req.body);
    const { user } = req;

    // Check if lead with this email already exists
    const existingLead = await prisma.lead.findFirst({
      where: {
        tenantId,
        customerEmail: validatedData.customerEmail,
        status: { not: 'LOST' } // Allow creating new lead if previous was lost
      }
    });

    if (existingLead) {
      return res.status(400).json({ 
        error: 'Lead with this email already exists',
        existingLeadId: existingLead.id,
        existingLeadStatus: existingLead.status
      });
    }

    // If car specified, verify it belongs to this tenant
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

    // If agent specified, verify it belongs to this tenant and is active
    let assignedAgentId = validatedData.agentId;
    if (assignedAgentId) {
      const agent = await prisma.agent.findFirst({
        where: {
          id: assignedAgentId,
          tenantId,
          status: 'ACTIVE'
        }
      });

      if (!agent) {
        return res.status(400).json({ error: 'Specified agent not found or inactive' });
      }
    }

    // Create the lead
    const leadData: any = {
      ...validatedData,
      tenantId,
      status: 'NEW',
      createdByAgentId: user!.id // Assuming the user creating is an agent
    };

    const lead = await prisma.lead.create({
      data: leadData,
      include: {
        agent: {
          select: { id: true, name: true, email: true }
        },
        car: {
          select: { 
            id: true, make: true, model: true, year: true, 
            price: true, mileage: true 
          }
        },
        createdByAgent: {
          select: { id: true, name: true }
        }
      }
    });

    // Auto-assign if no agent specified
    if (!assignedAgentId) {
      assignedAgentId = await autoAssignLead(lead.id, tenantId);
      if (assignedAgentId) {
        // Refresh lead data to include assigned agent
        const updatedLead = await prisma.lead.findUnique({
          where: { id: lead.id },
          include: {
            agent: {
              select: { id: true, name: true, email: true }
            },
            car: {
              select: { 
                id: true, make: true, model: true, year: true, 
                price: true, mileage: true 
              }
            },
            createdByAgent: {
              select: { id: true, name: true }
            }
          }
        });

        if (updatedLead) {
          Object.assign(lead, updatedLead);
        }
      }
    }

    // Log the lead creation
    await logAgentActivity(
      tenantId,
      assignedAgentId || user!.id,
      'LEAD_CREATED',
      `New lead created: ${lead.customerName}`,
      lead.id,
      { 
        source: lead.source, 
        priority: lead.priority,
        budget: lead.budget,
        createdBy: user!.id,
        autoAssigned: !validatedData.agentId 
      }
    );

    // Send notification to assigned agent
    if (assignedAgentId) {
      const notification = NotificationTemplates.leadAssigned(
        lead.customerName,
        lead.agent?.name || 'Agent'
      );
      await notifyAgent(tenantId, assignedAgentId, notification.title, notification.message, {
        leadId: lead.id,
        source: lead.source,
        priority: lead.priority,
      });
    }

    // Create follow-up task based on lead priority
    const followUpDelays: Record<string, number> = {
      URGENT: 2 * 60 * 60 * 1000,      // 2 hours
      HIGH: 4 * 60 * 60 * 1000,         // 4 hours
      MEDIUM: 24 * 60 * 60 * 1000,      // 1 day
      LOW: 3 * 24 * 60 * 60 * 1000,     // 3 days
    };
    const followUpDelay = followUpDelays[validatedData.priority] || followUpDelays.MEDIUM;
    await prisma.lead.update({
      where: { id: lead.id },
      data: {
        nextFollowUpAt: new Date(Date.now() + followUpDelay),
      },
    });

    return res.status(201).json({
      lead: {
        ...lead,
        metrics: {
          leadAgeDays: 0,
          lastContactDays: null,
          upcomingAppointments: 0,
          lastActivity: null
        }
      }
    });
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

export default requireTenantRole(['ADMIN', 'MANAGER', 'AGENT'])(handler);