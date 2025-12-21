import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id');
    
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const origin = searchParams.get('origin');
    const destination = searchParams.get('destination');
    const method = searchParams.get('method') || 'roro';
    const carValue = parseFloat(searchParams.get('carValue') || '0');

    // Get shipping rates based on route
    const shippingRates = await getShippingRates(origin, destination, method);
    
    if (!shippingRates) {
      return NextResponse.json(
        { error: 'Shipping rates not available for this route' },
        { status: 404 }
      );
    }

    // Calculate insurance (typically 1-2% of car value)
    const insurance = carValue * 0.015;

    // Get destination-specific costs
    const destinationCosts = getDestinationCosts(destination);

    // Calculate Zambian import duties and taxes
    const zambianTaxes = calculateZambianTaxes(carValue);

    return NextResponse.json({
      route: `${origin} → ${destination}`,
      method,
      costs: {
        freight: shippingRates.freight,
        insurance: Math.round(insurance),
        portCharges: destinationCosts.portCharges,
        inspectionFees: destinationCosts.inspectionFees,
        documentationFees: destinationCosts.documentationFees,
        agentFees: destinationCosts.agentFees,
        ...zambianTaxes
      },
      cifValue: carValue + shippingRates.freight + insurance,
      estimatedTransitDays: shippingRates.transitDays,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('GET /api/cif/shipping-rates error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate shipping rates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id');
    const userId = request.headers.get('x-user-id');
    
    if (!tenantId || !userId) {
      return NextResponse.json({ error: 'Tenant ID and User ID required' }, { status: 400 });
    }

    const calculationData = await request.json();

    // Save CIF calculation
    const calculation = await prisma.cIFCalculation.create({
      data: {
        tenantId,
        createdById: userId,
        carId: calculationData.carId || null,
        customerName: calculationData.customerName || null,
        carValue: calculationData.carValue,
        currency: calculationData.currency || 'USD',
        originPort: calculationData.originPort,
        destinationPort: calculationData.destinationPort,
        shippingMethod: calculationData.shippingMethod,
        freight: calculationData.freight,
        insurance: calculationData.insurance,
        portCharges: calculationData.portCharges,
        inspectionFees: calculationData.inspectionFees,
        documentationFees: calculationData.documentationFees,
        agentFees: calculationData.agentFees,
        importDuty: calculationData.importDuty,
        exciseDuty: calculationData.exciseDuty,
        vat: calculationData.vat,
        additionalCosts: calculationData.additionalCosts || [],
        cifValue: calculationData.cifValue,
        totalLandingCost: calculationData.totalLandingCost
      }
    });

    return NextResponse.json(calculation, { status: 201 });

  } catch (error) {
    console.error('POST /api/cif/calculations error:', error);
    return NextResponse.json(
      { error: 'Failed to save calculation' },
      { status: 500 }
    );
  }
}

// Helper function to get shipping rates
function getShippingRates(origin: string | null, destination: string | null, method: string) {
  if (!origin || !destination) return null;

  // Shipping rates database (in production, this would be in the database)
  const rates: { [key: string]: { [key: string]: { freight: number; transitDays: number } } } = {
    // From Japan
    'YOK': {
      'DAR': { freight: method === 'roro' ? 800 : 1200, transitDays: method === 'roro' ? 21 : 28 },
      'DUR': { freight: method === 'roro' ? 900 : 1350, transitDays: method === 'roro' ? 24 : 31 },
      'BEI': { freight: method === 'roro' ? 850 : 1250, transitDays: method === 'roro' ? 19 : 26 },
      'WAL': { freight: method === 'roro' ? 950 : 1400, transitDays: method === 'roro' ? 26 : 33 }
    },
    'TOK': {
      'DAR': { freight: method === 'roro' ? 820 : 1220, transitDays: method === 'roro' ? 21 : 28 },
      'DUR': { freight: method === 'roro' ? 920 : 1370, transitDays: method === 'roro' ? 24 : 31 },
      'BEI': { freight: method === 'roro' ? 870 : 1270, transitDays: method === 'roro' ? 19 : 26 },
      'WAL': { freight: method === 'roro' ? 970 : 1420, transitDays: method === 'roro' ? 26 : 33 }
    },
    'KOB': {
      'DAR': { freight: method === 'roro' ? 790 : 1180, transitDays: method === 'roro' ? 20 : 27 },
      'DUR': { freight: method === 'roro' ? 880 : 1320, transitDays: method === 'roro' ? 23 : 30 },
      'BEI': { freight: method === 'roro' ? 830 : 1230, transitDays: method === 'roro' ? 18 : 25 },
      'WAL': { freight: method === 'roro' ? 930 : 1380, transitDays: method === 'roro' ? 25 : 32 }
    },
    
    // From Dubai
    'DUB': {
      'DAR': { freight: method === 'roro' ? 600 : 900, transitDays: method === 'roro' ? 14 : 18 },
      'DUR': { freight: method === 'roro' ? 700 : 1000, transitDays: method === 'roro' ? 16 : 20 },
      'BEI': { freight: method === 'roro' ? 650 : 950, transitDays: method === 'roro' ? 12 : 16 },
      'WAL': { freight: method === 'roro' ? 750 : 1100, transitDays: method === 'roro' ? 18 : 22 }
    },

    // From Europe
    'ANT': {
      'DAR': { freight: method === 'roro' ? 1200 : 1800, transitDays: method === 'roro' ? 28 : 35 },
      'DUR': { freight: method === 'roro' ? 1100 : 1650, transitDays: method === 'roro' ? 25 : 32 },
      'BEI': { freight: method === 'roro' ? 1250 : 1850, transitDays: method === 'roro' ? 30 : 37 },
      'WAL': { freight: method === 'roro' ? 1000 : 1500, transitDays: method === 'roro' ? 22 : 29 }
    },
    'HAM': {
      'DAR': { freight: method === 'roro' ? 1250 : 1850, transitDays: method === 'roro' ? 29 : 36 },
      'DUR': { freight: method === 'roro' ? 1150 : 1700, transitDays: method === 'roro' ? 26 : 33 },
      'BEI': { freight: method === 'roro' ? 1300 : 1900, transitDays: method === 'roro' ? 31 : 38 },
      'WAL': { freight: method === 'roro' ? 1050 : 1550, transitDays: method === 'roro' ? 23 : 30 }
    },

    // From USA
    'LAX': {
      'DAR': { freight: method === 'roro' ? 1500 : 2200, transitDays: method === 'roro' ? 35 : 42 },
      'DUR': { freight: method === 'roro' ? 1400 : 2100, transitDays: method === 'roro' ? 32 : 39 },
      'BEI': { freight: method === 'roro' ? 1550 : 2250, transitDays: method === 'roro' ? 37 : 44 },
      'WAL': { freight: method === 'roro' ? 1300 : 1950, transitDays: method === 'roro' ? 30 : 37 }
    }
  };

  return rates[origin]?.[destination] || null;
}

// Helper function to get destination-specific costs
function getDestinationCosts(destination: string | null) {
  const costs: { [key: string]: any } = {
    'DAR': { // Dar es Salaam (Tanzania) - Most common for Zambia
      portCharges: 350,
      inspectionFees: 150,
      documentationFees: 200,
      agentFees: 300
    },
    'DUR': { // Durban (South Africa)
      portCharges: 400,
      inspectionFees: 180,
      documentationFees: 250,
      agentFees: 350
    },
    'BEI': { // Beira (Mozambique)
      portCharges: 320,
      inspectionFees: 140,
      documentationFees: 180,
      agentFees: 280
    },
    'WAL': { // Walvis Bay (Namibia)
      portCharges: 380,
      inspectionFees: 170,
      documentationFees: 220,
      agentFees: 320
    }
  };

  return costs[destination || 'DAR'] || costs['DAR'];
}

// Helper function to calculate Zambian import duties and taxes
function calculateZambianTaxes(carValue: number) {
  // Zambian import tax structure (as of 2024)
  const importDutyRate = 0.25; // 25%
  const exciseDutyRate = 0.10; // 10%
  const vatRate = 0.16; // 16%

  const importDuty = carValue * importDutyRate;
  const exciseDuty = carValue * exciseDutyRate;
  
  // VAT is calculated on (car value + import duty + excise duty)
  const vatableAmount = carValue + importDuty + exciseDuty;
  const vat = vatableAmount * vatRate;

  return {
    importDuty: Math.round(importDuty),
    exciseDuty: Math.round(exciseDuty),
    vat: Math.round(vat),
    totalTaxes: Math.round(importDuty + exciseDuty + vat)
  };
}