import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      tenantSlug,
      firstName,
      lastName,
      email,
      phone,
      password,
      country,
      city,
      budget,
      currency,
      preferredMakes,
      acceptTerms
    } = req.body;

    // Validation
    if (!tenantSlug || !firstName || !lastName || !email || !password || !acceptTerms) {
      return res.status(400).json({
        error: 'All required fields must be provided and terms must be accepted'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    // Find tenant
    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug }
    });

    if (!tenant) {
      return res.status(404).json({ error: 'Dealer not found' });
    }

    // Check if buyer already exists
    const existingBuyer = await prisma.buyer.findFirst({
      where: {
        email: email.toLowerCase(),
        tenantId: tenant.id
      }
    });

    if (existingBuyer) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create buyer
    const buyer = await prisma.buyer.create({
      data: {
        tenantId: tenant.id,
        email: email.toLowerCase(),
        firstName,
        lastName,
        phone,
        country,
        city,
        budget: budget ? parseFloat(budget) : null,
        currency: currency || 'USD',
        preferredMakes: preferredMakes || [],
        passwordHash,
        isActive: true,
        emailVerified: false,
        termsAcceptedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        country: true,
        city: true,
        budget: true,
        currency: true,
        preferredMakes: true,
        isActive: true,
        emailVerified: true,
        createdAt: true
      }
    });

    // Create default notification settings
    await prisma.buyerNotificationSettings.create({
      data: {
        buyerId: buyer.id,
        emailNotifications: true,
        smsNotifications: true,
        priceAlerts: true,
        newInventoryAlerts: true,
        orderUpdates: true,
        marketingEmails: false
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        buyerId: buyer.id,
        tenantId: tenant.id,
        email: buyer.email,
        type: 'buyer'
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      buyer,
      token,
      message: 'Registration successful'
    });
  } catch (error) {
    console.error('Buyer registration error:', error);
    return res.status(500).json({ error: 'Registration failed' });
  }
}