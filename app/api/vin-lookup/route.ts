import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vin = searchParams.get('vin');

    if (!vin || vin.length !== 17) {
      return NextResponse.json(
        { error: 'Valid 17-character VIN required' },
        { status: 400 }
      );
    }

    // Try NHTSA VIN Decoder API first (free, US-based)
    try {
      const nhtsaRes = await fetch(
        `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${encodeURIComponent(vin)}?format=json`
      );
      if (nhtsaRes.ok) {
        const nhtsaData = await nhtsaRes.json();
        const result = nhtsaData?.Results?.[0];
        if (result && result.Make && result.Make !== '') {
          return NextResponse.json({
            vin,
            make: result.Make,
            model: result.Model || 'Unknown',
            year: parseInt(result.ModelYear, 10) || null,
            bodyType: result.BodyClass || null,
            engineCc: result.DisplacementCC ? parseFloat(result.DisplacementCC) : null,
            fuelType: result.FuelTypePrimary || null,
            transmission: result.TransmissionStyle || null,
            drivetrain: result.DriveType || null,
            confidence: 0.95,
            source: 'NHTSA VIN Decoder',
          });
        }
      }
    } catch {
      // NHTSA unavailable - fall through to local decoder
    }

    // Fallback to local VIN decoding
    const vinData = mockVinDecode(vin);

    if (!vinData) {
      return NextResponse.json(
        { error: 'VIN not found or invalid' },
        { status: 404 }
      );
    }

    return NextResponse.json(vinData);

  } catch (error) {
    console.error('GET /api/vin-lookup error:', error);
    return NextResponse.json(
      { error: 'Failed to lookup VIN' },
      { status: 500 }
    );
  }
}

// Mock VIN decoder - replace with real service
function mockVinDecode(vin: string) {
  // Basic VIN validation
  if (!/^[A-HJ-NPR-Z0-9]{17}$/i.test(vin)) {
    return null;
  }

  // Extract basic info from VIN structure
  const worldManufacturerIdentifier = vin.substring(0, 3);
  const vehicleDescriptorSection = vin.substring(3, 9);
  const vehicleIdentifierSection = vin.substring(9, 17);
  const modelYear = getModelYearFromVin(vin.charAt(9));
  
  // Mock manufacturer mapping (simplified)
  const manufacturerMap: { [key: string]: string } = {
    'JTD': 'Toyota',
    '1HG': 'Honda', 
    '1G1': 'Chevrolet',
    '3VW': 'Volkswagen',
    'WBA': 'BMW',
    'JHM': 'Honda',
    '4T1': 'Toyota',
    '1FA': 'Ford',
    '5NP': 'Hyundai',
    'KNA': 'Kia'
  };

  const make = manufacturerMap[worldManufacturerIdentifier] || 'Unknown';
  
  // Mock model mapping based on VDS
  const modelMap: { [key: string]: { [key: string]: string } } = {
    'Toyota': {
      'JTD': 'Camry',
      '4T1': 'Corolla'
    },
    'Honda': {
      'JHM': 'Accord',
      '1HG': 'Civic'
    }
  };

  const model = modelMap[make]?.[worldManufacturerIdentifier] || 'Unknown Model';

  // Mock engine displacement based on engine code
  const engineCode = vin.charAt(7);
  const engineMap: { [key: string]: number } = {
    'A': 1500,
    'B': 1800,
    'C': 2000,
    'D': 2400,
    'E': 3000,
    'F': 3500
  };

  return {
    vin,
    make,
    model,
    year: modelYear,
    bodyType: getBodyTypeFromVin(vin),
    engineCc: engineMap[engineCode] || null,
    fuelType: getFuelTypeFromVin(vin),
    transmission: getTransmissionFromVin(vin),
    drivetrain: getDrivetrainFromVin(vin),
    confidence: 0.85, // Mock confidence score
    source: 'Mock VIN Decoder',
    decoded: {
      wmi: worldManufacturerIdentifier,
      vds: vehicleDescriptorSection,
      vis: vehicleIdentifierSection,
      checkDigit: vin.charAt(8),
      modelYear: vin.charAt(9),
      plantCode: vin.charAt(10),
      serialNumber: vin.substring(11)
    }
  };
}

function getModelYearFromVin(yearCode: string): number {
  const yearMap: { [key: string]: number } = {
    'A': 2010, 'B': 2011, 'C': 2012, 'D': 2013, 'E': 2014,
    'F': 2015, 'G': 2016, 'H': 2017, 'J': 2018, 'K': 2019,
    'L': 2020, 'M': 2021, 'N': 2022, 'P': 2023, 'R': 2024,
    'S': 2025, 'T': 2026, 'V': 2027, 'W': 2028, 'X': 2029,
    'Y': 2030, '1': 2031, '2': 2032, '3': 2033, '4': 2034,
    '5': 2035, '6': 2036, '7': 2037, '8': 2038, '9': 2039
  };
  
  return yearMap[yearCode.toUpperCase()] || new Date().getFullYear();
}

function getBodyTypeFromVin(vin: string): string {
  // Mock body type detection
  const bodyCode = vin.charAt(5);
  const bodyMap: { [key: string]: string } = {
    '1': 'Sedan',
    '2': 'Coupe', 
    '3': 'Convertible',
    '4': 'Hatchback',
    '5': 'SUV',
    '6': 'Truck',
    '7': 'Van',
    '8': 'Wagon'
  };
  
  return bodyMap[bodyCode] || 'Sedan';
}

function getFuelTypeFromVin(vin: string): string {
  // Mock fuel type detection
  const fuelCode = vin.charAt(6);
  const fuelMap: { [key: string]: string } = {
    'G': 'Petrol',
    'D': 'Diesel', 
    'H': 'Hybrid',
    'E': 'Electric',
    'F': 'Flex Fuel'
  };
  
  return fuelMap[fuelCode] || 'Petrol';
}

function getTransmissionFromVin(vin: string): string {
  // Mock transmission detection
  const transCode = vin.charAt(8);
  return ['1', '3', '5', '7', '9'].includes(transCode) ? 'Manual' : 'Automatic';
}

function getDrivetrainFromVin(vin: string): string {
  // Mock drivetrain detection
  const driveCode = vin.charAt(4);
  const driveMap: { [key: string]: string } = {
    '1': 'FWD',
    '2': 'RWD',
    '3': 'AWD',
    '4': '4WD'
  };
  
  return driveMap[driveCode] || 'FWD';
}