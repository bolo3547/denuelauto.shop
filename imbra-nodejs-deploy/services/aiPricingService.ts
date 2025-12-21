// Mock AI pricing service for car dealership

// Minimal local type describing the fields this service uses.
// Avoid importing Prisma model types directly to prevent build-time
// mismatches between Prisma client versions in different workspaces.
type CarShape = {
  year?: number | null;
  mileageKm?: number | null;
};

export async function predictPriceAndDemand(car: Partial<CarShape>): Promise<{ predictedPrice: number, predictedDemand: number }> {
  // In a real system, call an ML model or external API here
  // For now, use a simple mock based on year and mileage
  const basePrice = 10000;
  const ageFactor = car.year ? (2025 - car.year) * 0.05 : 1;
  const mileageFactor = car.mileageKm ? car.mileageKm / 100000 : 1;
  const predictedPrice = Math.max(2000, basePrice * (1 - ageFactor) * (1 - mileageFactor));
  const predictedDemand = Math.max(1, 100 - (ageFactor * 10 + mileageFactor * 20));
  return { predictedPrice, predictedDemand };
}
