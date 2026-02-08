import { NextApiRequest, NextApiResponse } from 'next';
import { requireTenantRole, AuthenticatedRequest, logAgentActivity } from '../../../../../middleware/tenantAuth';
import prisma from '../../../../../prismaClient';
import { z } from 'zod';
import { notifyAgent, notifyCustomer, NotificationTemplates } from '../../../../../notifications';

const updateAppointmentSchema = z.object({
  scheduledAt: z.string().transform((str) => new Date(str)).optional(),
  type: z.enum(['TEST_DRIVE', 'CONSULTATION', 'INSPECTION', 'DELIVERY', 'FOLLOW_UP', 'OTHER']).optional(),
  status: z.enum(['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  reminderEnabled: z.boolean().optional(),
  reminderMinutes: z.number().min(15).max(1440).optional(),
  carId: z.string().nullable().optional(),
  completionNotes: z.string().optional(),
  outcome: z.enum(['POSITIVE', 'NEGATIVE', 'NEUTRAL']).optional(),
  nextSteps: z.string().optional()
});

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { method } = req;
  const { tenantId } = req.user!;
  const { appointmentId } = req.query;

  if (!appointmentId || typeof appointmentId !== 'string') {
    return res.status(400).json({ error: 'Appointment ID is required' });
  }

  try {
    switch (method) {
      case 'GET':
        return await handleGetAppointment(req, res, tenantId, appointmentId);
      case 'PUT':
        return await handleUpdateAppointment(req, res, tenantId, appointmentId);
      case 'DELETE':
        return await handleCancelAppointment(req, res, tenantId, appointmentId);
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('Appointment API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGetAppointment(req: AuthenticatedRequest, res: NextApiResponse, tenantId: string, appointmentId: string) {
  const appointment = await prisma.appointment.findFirst({
    where: {
      id: appointmentId,
      tenantId
    },
    include: {
      agent: {
        select: { 
          id: true, name: true, email: true, phone: true,
          workingHours: true, skills: true 
        }
      },
      lead: {
        select: { 
          id: true, customerName: true, customerEmail: true, 
          customerPhone: true, status: true, priority: true,
          budget: true, interestedCarTypes: true, notes: true
        }
      },
      car: {
        select: { 
          id: true, make: true, model: true, year: true, 
          price: true, mileage: true, condition: true, 
          images: true, description: true 
        }
      },
      createdByAgent: {
        select: { id: true, name: true, email: true }
      }
    }
  });

  if (!appointment) {
    return res.status(404).json({ error: 'Appointment not found' });
  }

  // Get related appointments for this lead
  const relatedAppointments = await prisma.appointment.findMany({
    where: {
      leadId: appointment.leadId,
      id: { not: appointmentId }
    },
    select: {
      id: true, type: true, status: true, scheduledAt: true,
      agent: { select: { name: true } }
    },
    orderBy: { scheduledAt: 'desc' },
    take: 5
  });

  // Calculate appointment insights
  const now = new Date();
  const appointmentTime = new Date(appointment.scheduledAt);
  const isUpcoming = appointmentTime > now;
  const isPast = appointmentTime < now;
  const minutesUntil = Math.round((appointmentTime.getTime() - now.getTime()) / (1000 * 60));
  const minutesAgo = Math.round((now.getTime() - appointmentTime.getTime()) / (1000 * 60));

  // Get preparation checklist based on appointment type
  const preparationItems = getPreparationChecklist(appointment.type, appointment.car);

  return res.status(200).json({
    appointment: {
      ...appointment,
      insights: {
        isUpcoming,
        isPast,
        minutesUntil: isUpcoming ? minutesUntil : null,
        minutesAgo: isPast ? minutesAgo : null,
        canReschedule: isUpcoming && appointment.status === 'SCHEDULED',
        canComplete: appointment.status === 'CONFIRMED' || appointment.status === 'SCHEDULED',
        needsPreparation: isUpcoming && minutesUntil < 1440, // Less than 24 hours
        isOverdue: isPast && appointment.status === 'SCHEDULED'
      },
      preparationItems,
      relatedAppointments
    }
  });
}

async function handleUpdateAppointment(req: AuthenticatedRequest, res: NextApiResponse, tenantId: string, appointmentId: string) {
  try {
    const validatedData = updateAppointmentSchema.parse(req.body);
    const { user } = req;

    // Check if appointment exists and belongs to tenant
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        tenantId
      },
      include: {
        lead: { select: { customerName: true, customerEmail: true } },
        agent: { select: { name: true } }
      }
    });

    if (!existingAppointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // If rescheduling, check for conflicts
    if (validatedData.scheduledAt && validatedData.scheduledAt !== existingAppointment.scheduledAt) {
      const appointmentStart = new Date(validatedData.scheduledAt);
      const appointmentEnd = new Date(appointmentStart.getTime() + (60 * 60 * 1000));

      const conflictingAppointments = await prisma.appointment.findMany({
        where: {
          agentId: existingAppointment.agentId,
          id: { not: appointmentId },
          status: { in: ['SCHEDULED', 'CONFIRMED'] },
          scheduledAt: {
            gte: new Date(appointmentStart.getTime() - (30 * 60 * 1000)),
            lte: new Date(appointmentEnd.getTime() + (30 * 60 * 1000))
          }
        }
      });

      if (conflictingAppointments.length > 0) {
        return res.status(400).json({ 
          error: 'Agent has conflicting appointments at the new time',
          conflicts: conflictingAppointments.length
        });
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
        return res.status(400).json({ error: 'Car not found' });
      }
    }

    // Track what changed for logging
    const changes: string[] = [];
    Object.keys(validatedData).forEach(key => {
      const newValue = validatedData[key as keyof typeof validatedData];
      const oldValue = existingAppointment[key as keyof typeof existingAppointment];
      if (newValue !== oldValue) {
        changes.push(key);
      }
    });

    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        ...validatedData,
        updatedAt: new Date()
      },
      include: {
        agent: {
          select: { id: true, name: true, email: true }
        },
        lead: {
          select: { 
            id: true, customerName: true, customerEmail: true 
          }
        },
        car: {
          select: { 
            id: true, make: true, model: true, year: true, price: true 
          }
        }
      }
    });

    // Log the update
    let actionType = 'APPOINTMENT_UPDATED';
    let description = `Appointment updated: ${changes.join(', ')}`;

    if (changes.includes('status')) {
      actionType = `APPOINTMENT_${validatedData.status}`;
      description = `Appointment ${validatedData.status?.toLowerCase()}: ${existingAppointment.type} with ${existingAppointment.lead.customerName}`;
    } else if (changes.includes('scheduledAt')) {
      actionType = 'APPOINTMENT_RESCHEDULED';
      description = `Appointment rescheduled from ${existingAppointment.scheduledAt.toISOString()} to ${validatedData.scheduledAt?.toISOString()}`;
    }

    await logAgentActivity(
      tenantId,
      existingAppointment.agentId,
      actionType,
      description,
      existingAppointment.leadId,
      {
        appointmentId,
        changedFields: changes,
        updatedBy: user!.id,
        previousStatus: existingAppointment.status,
        newStatus: validatedData.status,
        outcome: validatedData.outcome,
        completionNotes: validatedData.completionNotes
      }
    );

    // Special handling for status changes
    if (validatedData.status && validatedData.status !== existingAppointment.status) {
      await handleAppointmentStatusChange(
        tenantId,
        appointmentId,
        existingAppointment,
        validatedData.status,
        validatedData.outcome,
        validatedData.nextSteps,
        user!.id
      );
    }

    // Send notifications based on changes
    if (changes.includes('status') && validatedData.status) {
      const notification = validatedData.status === 'CANCELLED'
        ? NotificationTemplates.appointmentCancelled(
            existingAppointment.type,
            existingAppointment.lead.customerName,
            existingAppointment.scheduledAt.toLocaleString()
          )
        : NotificationTemplates.appointmentConfirmation(
            existingAppointment.type,
            existingAppointment.lead.customerName,
            (validatedData.scheduledAt || existingAppointment.scheduledAt).toLocaleString(),
            existingAppointment.location || ''
          );
      await notifyAgent(tenantId, existingAppointment.agentId, notification.title, notification.message);
      if (existingAppointment.lead.customerEmail) {
        await notifyCustomer(existingAppointment.lead.customerEmail, notification.title, notification.message);
      }
    }

    // Send reminder updates if time changed
    if (changes.includes('scheduledAt') && validatedData.scheduledAt) {
      const notification = NotificationTemplates.appointmentRescheduled(
        existingAppointment.type,
        existingAppointment.lead.customerName,
        existingAppointment.scheduledAt.toLocaleString(),
        validatedData.scheduledAt.toLocaleString()
      );
      await notifyAgent(tenantId, existingAppointment.agentId, notification.title, notification.message);
      if (existingAppointment.lead.customerEmail) {
        await notifyCustomer(existingAppointment.lead.customerEmail, notification.title, notification.message);
      }
    }

    return res.status(200).json({ 
      appointment: updatedAppointment,
      changes 
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

async function handleCancelAppointment(req: AuthenticatedRequest, res: NextApiResponse, tenantId: string, appointmentId: string) {
  const { reason } = req.body;

  // Check if appointment exists and belongs to tenant
  const existingAppointment = await prisma.appointment.findFirst({
    where: {
      id: appointmentId,
      tenantId
    },
    include: {
      lead: { select: { customerName: true } }
    }
  });

  if (!existingAppointment) {
    return res.status(404).json({ error: 'Appointment not found' });
  }

  if (existingAppointment.status === 'CANCELLED') {
    return res.status(400).json({ error: 'Appointment is already cancelled' });
  }

  if (existingAppointment.status === 'COMPLETED') {
    return res.status(400).json({ error: 'Cannot cancel a completed appointment' });
  }

  // Cancel the appointment
  const cancelledAppointment = await prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      status: 'CANCELLED',
      notes: `${existingAppointment.notes || ''}\n[CANCELLED: ${new Date().toISOString()}] ${reason || 'No reason provided'}`,
      updatedAt: new Date()
    }
  });

  // Log the cancellation
  await logAgentActivity(
    tenantId,
    existingAppointment.agentId,
    'APPOINTMENT_CANCELLED',
    `Appointment cancelled: ${existingAppointment.type} with ${existingAppointment.lead.customerName}`,
    existingAppointment.leadId,
    {
      appointmentId,
      cancelledBy: req.user!.id,
      reason,
      originalScheduledAt: existingAppointment.scheduledAt
    }
  );

  // Send cancellation notifications
  const cancelNotification = NotificationTemplates.appointmentCancelled(
    existingAppointment.type,
    existingAppointment.lead.customerName,
    existingAppointment.scheduledAt.toLocaleString()
  );
  await notifyAgent(tenantId, existingAppointment.agentId, cancelNotification.title, cancelNotification.message);

  // Create follow-up task for cancelled appointments
  await logAgentActivity(
    tenantId,
    existingAppointment.agentId,
    'FOLLOW_UP_NEEDED',
    `Follow-up needed: ${existingAppointment.type} appointment with ${existingAppointment.lead.customerName} was cancelled`,
    existingAppointment.leadId,
    { appointmentId, reason }
  );

  return res.status(200).json({ 
    message: 'Appointment cancelled successfully',
    appointmentId 
  });
}

async function handleAppointmentStatusChange(
  tenantId: string,
  appointmentId: string,
  appointment: any,
  newStatus: string,
  outcome?: string,
  nextSteps?: string,
  userId?: string
) {
  if (newStatus === 'COMPLETED') {
    // Update lead based on appointment outcome
    if (outcome === 'POSITIVE') {
      await prisma.lead.update({
        where: { id: appointment.leadId },
        data: {
          status: 'INTERESTED',
          nextFollowUpAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days follow-up
          notes: `${appointment.lead.notes || ''}\nAppointment completed with positive outcome: ${nextSteps || ''}`
        }
      });
    } else if (outcome === 'NEGATIVE') {
      await prisma.lead.update({
        where: { id: appointment.leadId },
        data: {
          status: 'NOT_INTERESTED',
          notes: `${appointment.lead.notes || ''}\nAppointment completed with negative outcome: ${nextSteps || ''}`
        }
      });
    }

    // Create follow-up tasks based on outcome
    if (nextSteps) {
      await logAgentActivity(
        tenantId,
        appointment.agentId,
        'FOLLOW_UP_TASK_CREATED',
        `Follow-up task created after ${appointment.type}: ${nextSteps}`,
        appointment.leadId,
        { appointmentId, outcome, nextSteps }
      );
    }

    // Update agent performance metrics
    await logAgentActivity(
      tenantId,
      appointment.agentId,
      'APPOINTMENT_COMPLETED',
      `Completed ${appointment.type} appointment with outcome: ${outcome || 'NEUTRAL'}`,
      appointment.leadId,
      { appointmentId, outcome, completedBy: userId }
    );
  }

  // Handle other status changes
  if (newStatus === 'CONFIRMED') {
    // Set a reminder for the confirmed appointment
    await logAgentActivity(
      tenantId,
      appointment.agentId,
      'APPOINTMENT_CONFIRMED',
      `Appointment confirmed: ${appointment.type} with ${appointment.lead.customerName}`,
      appointment.leadId,
      { appointmentId }
    );
  } else if (newStatus === 'NO_SHOW') {
    // Mark lead follow-up and log no-show
    await prisma.lead.update({
      where: { id: appointment.leadId },
      data: {
        nextFollowUpAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Follow up next day
        notes: `${appointment.lead.notes || ''}\nNo-show for ${appointment.type} on ${appointment.scheduledAt.toISOString()}`,
      },
    });

    await logAgentActivity(
      tenantId,
      appointment.agentId,
      'APPOINTMENT_NO_SHOW',
      `No-show: ${appointment.type} with ${appointment.lead.customerName}`,
      appointment.leadId,
      { appointmentId }
    );
  }
}

function getPreparationChecklist(appointmentType: string, car: any): string[] {
  const baseItems = [
    'Confirm appointment with customer 24h prior',
    'Review customer file and preferences',
    'Prepare necessary documentation'
  ];

  const typeSpecificItems: Record<string, string[]> = {
    TEST_DRIVE: [
      'Verify customer has valid driver\'s license',
      'Check car fuel level and cleanliness',
      'Prepare test drive route',
      'Have insurance verification ready'
    ],
    CONSULTATION: [
      'Prepare financing options and quotes',
      'Research comparable vehicles',
      'Prepare trade-in evaluation forms'
    ],
    INSPECTION: [
      'Ensure vehicle is clean and accessible',
      'Prepare vehicle history report',
      'Have maintenance records ready'
    ],
    DELIVERY: [
      'Complete all paperwork and contracts',
      'Perform final vehicle inspection',
      'Prepare delivery checklist and keys'
    ],
    FOLLOW_UP: [
      'Review previous interaction notes',
      'Prepare updated offers or information',
      'Have next steps options ready'
    ]
  };

  return [...baseItems, ...(typeSpecificItems[appointmentType] || [])];
}

export default requireTenantRole(['ADMIN', 'MANAGER', 'AGENT'])(handler);