// Simple trade-in valuation utility
export function estimateTradeInValue({ year, mileageKm, make, model, condition }: {
  year: number;
  mileageKm: number;
  make: string;
  model: string;
  condition?: string;
}) {
  // Mock logic: newer, lower mileage, better condition = higher value
  const baseValue = 8000;
  const ageFactor = (2025 - year) * 0.07;
  const mileageFactor = mileageKm / 120000;
  const conditionFactor = condition === 'excellent' ? 1.1 : condition === 'good' ? 1 : 0.8;
  const value = Math.max(1000, baseValue * (1 - ageFactor) * (1 - mileageFactor) * conditionFactor);
  return Math.round(value * 100) / 100;
}
