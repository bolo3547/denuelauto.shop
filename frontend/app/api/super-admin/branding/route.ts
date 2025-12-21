const IS_STATIC_EXPORT = !!process.env.STATIC_EXPORT;

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// File-based storage path
const getSettingsPath = () => path.join(process.cwd(), 'public', 'branding-settings.json');

// GET - Fetch branding settings (public - no auth required)
export async function GET() {
  if (IS_STATIC_EXPORT)
return NextResponse.json({ ok: false }, { status: 200 });
  try {
    // Try to load from file
    const settingsPath = getSettingsPath();
    try {
      const fileContent = await fs.readFile(settingsPath, 'utf-8');
      return NextResponse.json(JSON.parse(fileContent));
    } catch {
      // File doesn't exist, return defaults
      return NextResponse.json({
        branding: {
          siteName: 'Denuel Auto',
          tagline: 'Your Trusted Car Dealership Partner',
          logoUrl: '',
          logoLightUrl: '',
          logoDarkUrl: '',
          faviconUrl: '',
          primaryColor: '#1E40AF',
          secondaryColor: '#FFD700',
          // heroTitle: 'The Operating System for Modern Car Dealerships',
          heroSubtitle: 'Denuel Auto combines inventory, sales, finance, HR, and marketing into one platform. Collect payments (Airtel/MTN), automate approvals, and give every branch a single source of truth.'
        },
        reviews: [
          { id: '1', name: 'Linda K.', role: 'GM, Multi-branch dealer', quote: 'We cut onboarding time in half and finally see live stock across all yards.', rating: 5, avatarUrl: '', isActive: true },
          { id: '2', name: 'Tapiwa M.', role: 'Sales Director', quote: 'Agents close faster with MoMo receipts and approval flows baked in.', rating: 5, avatarUrl: '', isActive: true },
          { id: '3', name: 'Aisha N.', role: 'Head of Finance', quote: 'Commission and payout tracking is now automatic—no more spreadsheets.', rating: 5, avatarUrl: '', isActive: true }
        ]
      });
    }

  } catch (error) {
    console.error('Get branding error:', error);
    return NextResponse.json({
      branding: {
        siteName: 'Denuel Auto',
        tagline: 'Your Trusted Car Dealership Partner',
        logoUrl: '',
        logoLightUrl: '',
        logoDarkUrl: '',
        faviconUrl: '',
        primaryColor: '#1E40AF',
        secondaryColor: '#FFD700',
        // heroTitle: 'The Operating System for Modern Car Dealerships',
        heroSubtitle: 'Denuel Auto combines inventory, sales, finance, HR, and marketing into one platform.'
      },
      reviews: []
    });
  }
}

// POST - Save branding settings (requires super admin auth)
export async function POST(request: NextRequest) {
  if (IS_STATIC_EXPORT)
return NextResponse.json({ ok: false }, { status: 200 });
  try {
    const data = await request.json();
    
    // Save to file
const settingsPath = getSettingsPath();
    await fs.writeFile(settingsPath, JSON.stringify(data, null, 2));
    
    return NextResponse.json({ success: true, message: 'Branding settings saved successfully' });
  } catch (error) {
    console.error('Save branding error:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}

// PUT - Update branding settings (alias for POST)
export async function PUT(request: NextRequest) {
  if (IS_STATIC_EXPORT)
return NextResponse.json({ ok: false }, { status: 200 });return POST(request);
}
