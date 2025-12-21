export interface Car {
  id?: string;
  stockNo?: string;
  make?: string;
  model?: string;
  year?: number;
  grade?: string;
  mileage_km?: number;
  engine_cc?: number;
  transmission?: string;
  fuel?: string;
  price_local_zmw?: number;
  price_usd?: number;
  images?: string[];
  main_image_url?: string;
  vin?: string;
  status?: string;
  location?: string;
  activeProformaId?: string;
  [key: string]: unknown;
}
