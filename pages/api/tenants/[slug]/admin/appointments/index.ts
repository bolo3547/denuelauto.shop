import { NextApiRequest, NextApiResponse } from 'next';
import { requireTenantRole, AuthenticatedRequest, logAgentActivity } from '../../../../middleware/tenantAuth';
import prisma from '../../../../prismaClient';
import { z } from 'zod';

// Validation schemas
const createAppointmentSchema = z.object({
  leadId: z.string().min(1, 'Lead ID is required'),
  agentId: z.string().min(1, 'Agent ID is required'),
  scheduledAt: z.string().transform((str) => new Date(str)),
  type: z.enum(['TEST_DRIVE', 'CONSULTATION', 'INSPECTION', 'DELIVERY', 'FOLLOW_UP', 'OTHER']).default('CONSULTATION'),
  location: z.string().min(1, 'Location is required'),
  notes: z.string().optional(),
  reminderEnabled: z.boolean().default(true),
  reminderMinutes: z.number().min(15).max(1440).default(60), // 15 minutes to 24 hours
  carId: z.string().optional()
});

const updateAppointmentSchema = z.object({
  scheduledAt: z.string().transform((str) => new Date(str)).optional(),
  type: z.enum(['TEST_DRIVE', 'CONSULTATION', 'INSPECTION', 'DELIVERY', 'FOLLOW_UP', 'OTHER']).optional(),
  status: z.enum(['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  reminderEnabled: z.boolean().optional(),
  reminderMinutes: z.number().min(15).max(1440).optional(),
  carId: z.string().nullable().optional(),
  completionNotes: z.string().optional()
});

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { method } = req;
  const { tenantId } = req.user!;

  try {
    switch (method) {
      case 'GET':
        return await handleGetAppointments(req, res, tenantId);
      case 'POST':
        return await handleCreateAppointment(req, res, tenantId);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('Appointments API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGetAppointments(req: AuthenticatedRequest, res: NextApiResponse, tenantId: string) {
  const { 
    page = '1', 
    limit = '10', 
    agentId = 'all',
    status = 'all',
    type = 'all',
    dateFrom,
    dateTo,
    view = 'list', // 'list' or 'calendar'
    sortBy = 'scheduledAt',
    sortOrder = 'asc'
  } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const offset = (pageNum - 1) * limitNum;

  // Build filter conditions
  const where: any = { tenantId };
  
  if (agentId !== 'all') {
    where.agentId = agentId;
  }

  if (status !== 'all') {
    where.status = status;
  }

  if (type !== 'all') {
    where.type = type;
  }

  // Date filtering
  if (dateFrom || dateTo) {
    where.scheduledAt = {};
    if (dateFrom) {
      where.scheduledAt.gte = new Date(dateFrom as string);
    }
    if (dateTo) {
      where.scheduledAt.lte = new Date(dateTo as string);
    }
  } else if (view === 'calendar') {
    // Default to current month for calendar view
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    where.scheduledAt = {
      gte: startOfMonth,
      lte: endOfMonth
    };
  }

  // Build sort conditions
  const orderBy: any = {};
  if (sortBy === 'agent') {
    orderBy.agent = { name: sortOrder };
  } else if (sortBy === 'customer') {
    orderBy.lead = { customerName: sortOrder };
  } else {
    orderBy[sortBy as string] = sortOrder;
  }

  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      include: {
        agent: {
          select: { id: true, name: true, email: true, phone: true }
        },
        lead: {
          select: { 
            id: true, customerName: true, customerEmail: true, 
            customerPhone: true, status: true, priority: true 
          }
        },
        car: {
          select: { 
            id: true, make: true, model: true, year: true, 
            price: true, images: true, condition: true 
          }
        }
      },
      orderBy,
      skip: view === 'calendar' ? undefined : offset,
      take: view === 'calendar' ? undefined : limitNum
    }),
    view === 'calendar' ? 0 : prisma.appointment.count({ where })
  ]);

  // Add additional metadata for each appointment
  const appointmentsWithMetadata = appointments.map(appointment => {
    const now = new Date();
    const appointmentTime = new Date(appointment.scheduledAt);
    const isUpcoming = appointmentTime > now;
    const isPast = appointmentTime < now;
    const hoursUntil = Math.round((appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60));
    const hoursAgo = Math.round((now.getTime() - appointmentTime.getTime()) / (1000 * 60 * 60));

    return {
      ...appointment,
      metadata: {
        isUpcoming,
        isPast,
        hoursUntil: isUpcoming ? hoursUntil : null,
        hoursAgo: isPast ? hoursAgo : null,
        isToday: appointmentTime.toDateString() === now.toDateString(),
        canReschedule: isUpcoming && appointment.status === 'SCHEDULED',
        needsFollowUp: appointment.status === 'COMPLETED' && !appointment.completionNotes
      }
    };
  });

  if (view === 'calendar') {
    // Group appointments by date for calendar view
    const groupedByDate = appointmentsWithMetadata.reduce((acc, appointment) => {
      const dateKey = appointment.scheduledAt.toISOString().split('T')[0];
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(appointment);
      return acc;
    }, {} as Record<string, any[]>);

    return res.status(200).json({
      calendar: groupedByDate,
      summary: {
        totalAppointments: appointments.length,
        byStatus: appointments.reduce((acc, apt) => {
          acc[apt.status] = (acc[apt.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        byType: appointments.reduce((acc, apt) => {
          acc[apt.type] = (acc[apt.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      }
    });
  }

  return res.status(200).json({
    appointments: appointmentsWithMetadata,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    }
  });
}

async function handleCreateAppointment(req: AuthenticatedRequest, res: NextApiResponse, tenantId: string) {
  try {
    const validatedData = createAppointmentSchema.parse(req.body);
    const { user } = req;

    // Verify lead exists and belongs to tenant
    const lead = await prisma.lead.findFirst({
      where: {
        id: validatedData.leadId,
        tenantId
      },
      select: { id: true, customerName: true, customerEmail: true, agentId: true }
    });

    if (!lead) {
      return res.status(400).json({ error: 'Lead not found' });
    }

    // Verify agent exists, belongs to tenant, and is active
    const agent = await prisma.agent.findFirst({
      where: {
        id: validatedData.agentId,
        tenantId,
        status: 'ACTIVE'
      },
      select: { id: true, name: true, email: true, workingHours: true }
    });

    if (!agent) {
      return res.status(400).json({ error: 'Agent not found or inactive' });
    }

    // If car specified, verify it belongs to tenant
    if (validatedData.carId) {
      const car = await prisma.car.findFirst({
        where: {
          id: validatedData.carId,
          tenantId
        }
      });

      if (!car) {
        return res.status(400).json({ error: 'Car not found' });
      }
    }

    // Check for scheduling conflicts
    const appointmentStart = new Date(validatedData.scheduledAt);
    const appointmentEnd = new Date(appointmentStart.getTime() + (60 * 60 * 1000)); // 1 hour default duration

    const conflictingAppointments = await prisma.appointment.findMany({
      where: {
        agentId: validatedData.agentId,
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
        scheduledAt: {
          gte: new Date(appointmentStart.getTime() - (30 * 60 * 1000)), // 30 min buffer before
          lte: new Date(appointmentEnd.getTime() + (30 * 60 * 1000))     // 30 min buffer after
        }
      },
      select: { id: true, scheduledAt: true, lead: { select: { customerName: true } } }
    });

    if (conflictingAppointments.length > 0) {
      return res.status(400).json({ 
        error: 'Agent has conflicting appointments',
        conflicts: conflictingAppointments.map(apt => ({
          appointmentId: apt.id,
          scheduledAt: apt.scheduledAt,
          customerName: apt.lead.customerName
        }))
      });
    }

    // TODO: Validate against agent working hours
    // const dayOfWeek = appointmentStart.toLocaleDateString('en-US', { weekday: 'lowercase' });
    // const workingHours = agent.workingHours?.[dayOfWeek];

    // Create the appointment
    const appointment = await prisma.appointment.create({
      data: {
        ...validatedData,
        tenantId,
        status: 'SCHEDULED',
        createdByAgentId: user!.id
      },
      include: {
        agent: {
          select: { id: true, name: true, email: true }
        },
        lead: {
          select: { 
            id: true, customerName: true, customerEmail: true, customerPhone: true 
          }
        },
        car: {
          select: { 
            id: true, make: true, model: true, year: true, price: true 
          }
        }
      }
    });

    // Log the appointment creation
    await logAgentActivity(
      tenantId,
      validatedData.agentId,
      'APPOINTMENT_SCHEDULED',
      `Appointment scheduled: ${validatedData.type} with ${lead.customerName}`,
      validatedData.leadId,
      {
        appointmentId: appointment.id,
        appointmentType: validatedData.type,
        scheduledAt: validatedData.scheduledAt,
        location: validatedData.location,
        createdBy: user!.id,
        customerName: lead.customerName
      }
    );

    // Update lead's next follow-up date if this is their first appointment
    if (lead.agentId === validatedData.agentId) {
      await prisma.lead.update({
        where: { id: validatedData.leadId },
        data: {
          nextFollowUpAt: appointmentStart,
          status: 'INTERESTED' // Move to interested if still in earlier stages
        }
      });
    }

    // TODO: Send confirmation emails to customer and agent
    // TODO: Set up appointment reminders
    // TODO: Add to agent's calendar

    return res.status(201).json({
      appointment,
      message: 'Appointment scheduled successfully'
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