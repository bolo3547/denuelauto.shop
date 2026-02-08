import { NextApiRequest, NextApiResponse } from 'next';
import { requireTenantRole, AuthenticatedRequest, logAgentActivity } from '../../../../middleware/tenantAuth';
import prisma from '../../../../prismaClient';
import { z } from 'zod';
import { notifyAgent, NotificationTemplates } from '../../../../notifications';

// Validation schemas
const createAgentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional(),
  skills: z.array(z.string()).default([]),
  maxLeadsPerDay: z.number().min(1).max(100).default(10),
  workingHours: z.object({
    monday: z.object({ start: z.string(), end: z.string() }).optional(),
    tuesday: z.object({ start: z.string(), end: z.string() }).optional(),
    wednesday: z.object({ start: z.string(), end: z.string() }).optional(),
    thursday: z.object({ start: z.string(), end: z.string() }).optional(),
    friday: z.object({ start: z.string(), end: z.string() }).optional(),
    saturday: z.object({ start: z.string(), end: z.string() }).optional(),
    sunday: z.object({ start: z.string(), end: z.string() }).optional(),
  }).default({}),
  portalAccess: z.boolean().default(false),
  role: z.enum(['AGENT', 'SENIOR_AGENT', 'TEAM_LEAD']).default('AGENT')
});

const updateAgentSchema = createAgentSchema.partial();

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { method } = req;
  const { tenantId } = req.user!;

  try {
    switch (method) {
      case 'GET':
        return await handleGetAgents(req, res, tenantId);
      case 'POST':
        return await handleCreateAgent(req, res, tenantId);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('Agents API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGetAgents(req: AuthenticatedRequest, res: NextApiResponse, tenantId: string) {
  const { 
    page = '1', 
    limit = '10', 
    search = '', 
    status = 'all',
    role = 'all',
    sortBy = 'name',
    sortOrder = 'asc'
  } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const offset = (pageNum - 1) * limitNum;

  // Build filter conditions
  const where: any = { tenantId };
  
  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { email: { contains: search as string, mode: 'insensitive' } },
      { phone: { contains: search as string, mode: 'insensitive' } }
    ];
  }

  if (status !== 'all') {
    where.status = status;
  }

  if (role !== 'all') {
    where.role = role;
  }

  // Build sort conditions
  const orderBy: any = {};
  orderBy[sortBy as string] = sortOrder;

  const [agents, total] = await Promise.all([
    prisma.agent.findMany({
      where,
      include: {
        _count: {
          select: { 
            assignedLeads: { where: { status: { in: ['NEW', 'CONTACTED', 'INTERESTED'] } } },
            createdLeads: true,
            activityLogs: {
              where: {
                createdAt: {
                  gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
                }
              }
            }
          }
        }
      },
      orderBy,
      skip: offset,
      take: limitNum
    }),
    prisma.agent.count({ where })
  ]);

  // Calculate performance metrics for each agent
  const agentsWithMetrics = await Promise.all(
    agents.map(async (agent) => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      // Get conversion metrics
      const [leadsConverted, totalAssignedLeads, recentActivity] = await Promise.all([
        prisma.lead.count({
          where: {
            agentId: agent.id,
            status: 'CONVERTED',
            updatedAt: { gte: thirtyDaysAgo }
          }
        }),
        prisma.lead.count({
          where: {
            agentId: agent.id,
            assignedAt: { gte: thirtyDaysAgo }
          }
        }),
        prisma.agentActivityLog.findFirst({
          where: { agentId: agent.id },
          orderBy: { createdAt: 'desc' }
        })
      ]);

      const conversionRate = totalAssignedLeads > 0 ? (leadsConverted / totalAssignedLeads) * 100 : 0;

      return {
        ...agent,
        metrics: {
          activeLeads: agent._count.assignedLeads,
          totalLeadsCreated: agent._count.createdLeads,
          recentActivities: agent._count.activityLogs,
          conversionRate: Math.round(conversionRate * 100) / 100,
          lastActivity: recentActivity?.createdAt || null
        }
      };
    })
  );

  return res.status(200).json({
    agents: agentsWithMetrics,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    }
  });
}

async function handleCreateAgent(req: AuthenticatedRequest, res: NextApiResponse, tenantId: string) {
  try {
    const validatedData = createAgentSchema.parse(req.body);

    // Check if agent with this email already exists in this tenant
    const existingAgent = await prisma.agent.findFirst({
      where: {
        tenantId,
        email: validatedData.email
      }
    });

    if (existingAgent) {
      return res.status(400).json({ error: 'Agent with this email already exists' });
    }

    const agent = await prisma.agent.create({
      data: {
        ...validatedData,
        tenantId,
        status: 'ACTIVE'
      },
      include: {
        _count: {
          select: { 
            assignedLeads: true,
            createdLeads: true 
          }
        }
      }
    });

    // Log the creation
    await logAgentActivity(
      tenantId,
      agent.id,
      'AGENT_CREATED',
      `Agent profile created: ${agent.name}`,
      undefined,
      { email: agent.email, role: agent.role }
    );

    // Send welcome email to agent
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { name: true } });
    const welcomeNotification = NotificationTemplates.agentWelcome(agent.name, tenant?.name || 'Denuel Auto');
    await notifyAgent(tenantId, agent.id, welcomeNotification.title, welcomeNotification.message, {
      role: agent.role,
      portalAccess: validatedData.portalAccess,
    });

    // Create initial onboarding tasks via activity log
    await logAgentActivity(
      tenantId,
      agent.id,
      'ONBOARDING_STARTED',
      `Onboarding started for ${agent.name}: Complete profile, review training materials, connect with team lead`,
      undefined,
      { tasks: ['Complete profile', 'Review training materials', 'Connect with team lead', 'Set availability schedule'] }
    );

    return res.status(201).json({
      agent: {
        ...agent,
        metrics: {
          activeLeads: 0,
          totalLeadsCreated: 0,
          recentActivities: 0,
          conversionRate: 0,
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

export default requireTenantRole(['ADMIN', 'MANAGER'])(handler);