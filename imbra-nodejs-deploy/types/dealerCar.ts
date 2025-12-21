export type DealerCar = {
  id: string;
  stockNo: string;
  make: string;
  model: string;
  grade?: string;
  year: number;
  mileage_km: number;
  engine_cc: number;
  transmission: string; // AT/MT
  fuel: string; // Petrol/Diesel/Hybrid
  steering: string; // RHD/LHD
  price_usd?: number;
  price_local_zmw?: number;
  currency: 'ZMW' | 'USD';
  location: string;
  portOption?: string;
  bodyType?: string;
  color?: string;
  images: string[];
  status: 'Available' | 'Reserved' | 'Sold';
  vin: string;
  inspectionReportUrl?: string;
};
