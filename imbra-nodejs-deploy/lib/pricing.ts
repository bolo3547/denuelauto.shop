// pricing.ts
import { BillingSummary, PlanCode } from '../types/dealer';
import { BASE_PRICES } from './dealerConstants';

export function calculateDealerPrice(input: {
  planCode: PlanCode;
  country: string;
  branchesCount: number;
  exporter: boolean;
  initialStockVolume: string;
  features: {
    agentsEnabled: boolean;
    buyerPortalEnabled: boolean;
    serviceEnabled: boolean;
    favouritesEnabled: boolean;
  };
}): BillingSummary {
  const { planCode, country, branchesCount, exporter, initialStockVolume, features } = input;

  const currency = country === 'Zambia' ? 'ZMW' : 'USD';
  const basePrice = BASE_PRICES[planCode];

  const lines: BillingSummary['lines'] = [
    { label: `${planCode.charAt(0).toUpperCase() + planCode.slice(1)} Plan`, amount: basePrice, type: 'base' },
  ];

  // Branch surcharge
  if (branchesCount > 1) {
    const surcharge = (branchesCount - 1) * 300;
    lines.push({ label: `Branch surcharge (${branchesCount - 1} extra)`, amount: surcharge, type: 'surcharge' });
  }

  // Stock volume surcharge
  let stockSurcharge = 0;
  if (initialStockVolume === '21-50') stockSurcharge = 200;
  else if (initialStockVolume === '51-150') stockSurcharge = 400;
  else if (initialStockVolume === '150+') stockSurcharge = 800;
  if (stockSurcharge > 0) {
    lines.push({ label: `Stock volume surcharge (${initialStockVolume})`, amount: stockSurcharge, type: 'surcharge' });
  }

  // Exporter add-on
  if (exporter) {
    let exporterAddon = 0;
    if (planCode === 'growth') exporterAddon = 800;
    else if (planCode === 'starter') exporterAddon = 1500;
    if (exporterAddon > 0) {
      lines.push({ label: 'Exporter module', amount: exporterAddon, type: 'addon' });
    }
  }

  // Modules
  if (features.buyerPortalEnabled && planCode === 'starter') {
    lines.push({ label: 'Buyer portal', amount: 200, type: 'addon' });
  }
  if (features.agentsEnabled && planCode === 'starter') {
    lines.push({ label: 'Agents module', amount: 150, type: 'addon' });
  }
  if (features.serviceEnabled) {
    lines.push({ label: 'Service module', amount: 300, type: 'addon' });
  }
  // Favourites is free

  const total = lines.reduce((sum, line) => sum + line.amount, 0);

  return {
    currency,
    planCode,
    basePrice,
    lines,
    total,
  };
}