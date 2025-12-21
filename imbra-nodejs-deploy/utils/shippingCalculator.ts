// Simple shipping cost calculator for multi-market export
export function calculateShipping({ port, country, carSize }: {
  port: string;
  country: string;
  carSize: 'small' | 'medium' | 'large';
}) {
  // Mock rates by port/country/size
  const baseRates: Record<string, { small: number; medium: number; large: number }> = {
    'Dar es Salaam': { small: 800, medium: 1200, large: 1600 },
    'Durban': { small: 900, medium: 1300, large: 1700 },
    'Walvis Bay': { small: 950, medium: 1350, large: 1750 },
    'Mombasa': { small: 850, medium: 1250, large: 1650 },
  };
  const portRates = baseRates[port] ?? baseRates['Dar es Salaam'];
  const cost = portRates[carSize] || portRates['medium'];
  // Add country adjustment (mock)
  const countryFactor = country === 'Zambia' ? 1 : country === 'Zimbabwe' ? 1.1 : 1.2;
  return Math.round(cost * countryFactor);
}
