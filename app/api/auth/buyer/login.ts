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
    const { tenantSlug, email, password } = req.body;

    // Validation
    if (!tenantSlug || !email || !password) {
      return res.status(400).json({
        error: 'Dealer, email, and password are required'
      });
    }

    // Find tenant
    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug }
    });

    if (!tenant) {
      return res.status(404).json({ error: 'Dealer not found' });
    }

    // Find buyer
    const buyer = await prisma.buyer.findFirst({
      where: {
        email: email.toLowerCase(),
        tenantId: tenant.id
      }
    });

    if (!buyer) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if account is active
    if (!buyer.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, buyer.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await prisma.buyer.update({
      where: { id: buyer.id },
      data: { lastLoginAt: new Date() }
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

    // Return buyer data (without password hash)
    const { passwordHash, ...buyerData } = buyer;

    return res.status(200).json({
      buyer: buyerData,
      token,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Buyer login error:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
}