import { PricingBreakdown, PricingLine, PromoCode, TenantPricingInput } from '@/types/tenantRegistration';

const BASE_PRICES_MINOR: Record<PricingBreakdown['tier'], number> = {
  small: 5000 * 100,
  medium: 15000 * 100,
  large: 45000 * 100,
  enterprise: 100000 * 100,
};

const TIER_LIMITS: Record<PricingBreakdown['tier'], number> = {
  small: 20,
  medium: 100,
  large: 500,
  enterprise: 1000000, // effectively "no cap"
};

const ADD_ON_PRICES_MINOR = {
  cifCalculator: 2000 * 100,
  onlinePayments: 3000 * 100,
  whatsappIntegration: 1200 * 100,
  apiAccess: 5000 * 100,
  multiWarehouse: 2500 * 100,
  customerAccounts: 0, // included
};

export function determineTier(expectedListings: number): PricingBreakdown['tier'] {
  if (expectedListings <= 20) return 'small';
  if (expectedListings <= 100) return 'medium';
  if (expectedListings <= 500) return 'large';
  return 'enterprise';
}

export function isPromoValid(promo: PromoCode | null | undefined): promo is PromoCode {
  if (!promo) return false;
  if (!promo.isActive) return false;
  const expires = new Date(promo.expiresAt);
  if (Number.isNaN(expires.getTime())) return false;
  return expires.getTime() > Date.now();
}

export function calculateTenantPricing(
  input: TenantPricingInput,
  promo?: PromoCode | null,
  opts?: { taxRatePct?: number }
): PricingBreakdown {
  const taxRatePct = opts?.taxRatePct ?? input.taxRatePct ?? 0;
  const tier = determineTier(input.expectedListings);
  const basePriceMinor = BASE_PRICES_MINOR[tier];
  const lines: PricingLine[] = [
    {
      label: `${tier.charAt(0).toUpperCase() + tier.slice(1)} tier`,
      amountMinor: basePriceMinor,
      type: 'base',
      description: `Covers up to ${TIER_LIMITS[tier]} listings per month`,
    },
  ];

  let addOnTotalMinor = 0;
  const addOns = input.addOns;
  (['cifCalculator', 'onlinePayments', 'whatsappIntegration', 'apiAccess', 'multiWarehouse', 'customerAccounts'] as const).forEach(key => {
    if (addOns[key]) {
      const amountMinor = ADD_ON_PRICES_MINOR[key];
      if (amountMinor > 0) {
        lines.push({ label: addonLabel(key), amountMinor, type: 'addon' });
        addOnTotalMinor += amountMinor;
      }
    }
  });

  const branchSurchargeMinor = Math.max(0, input.branchCount - 1) * 2500 * 100;
  if (branchSurchargeMinor > 0) {
    lines.push({ label: 'Additional branches', amountMinor: branchSurchargeMinor, type: 'surcharge', description: 'K2,500 per branch after the first' });
  }

  const staffSurchargeMinor = Math.max(0, input.staffCount - 20) * 200 * 100;
  if (staffSurchargeMinor > 0) {
    lines.push({ label: 'Staff surcharge', amountMinor: staffSurchargeMinor, type: 'surcharge', description: 'K200 per staff member above 20' });
  }

  const tierLimit = TIER_LIMITS[tier];
  const overageListings = Math.max(0, input.expectedListings - tierLimit);
  const overageMinor = overageListings * 100 * 100;
  if (overageMinor > 0) {
    lines.push({ label: 'Listings overage', amountMinor: overageMinor, type: 'overage', description: `K100 each for ${overageListings} listings over your tier` });
  }

  const surchargeTotalMinor = branchSurchargeMinor + staffSurchargeMinor + overageMinor;
  const subtotalMinor = basePriceMinor + addOnTotalMinor + surchargeTotalMinor;

  let discountTotalMinor = 0;
  let appliedPromo: PromoCode | null = null;
  if (promo && isPromoValid(promo) && promo.currency === 'ZMW') {
    appliedPromo = promo;
    const promoAmount = promo.type === 'PERCENT'
      ? Math.floor((subtotalMinor * promo.value) / 100)
      : Math.round(promo.value * 100);
    if (promoAmount > 0) {
      discountTotalMinor += promoAmount;
      lines.push({ label: `Promo ${promo.code}`, amountMinor: -promoAmount, type: 'discount' });
    }
  }

  const netMonthlyBeforeTax = Math.max(0, subtotalMinor - discountTotalMinor);
  const taxMinor = Math.round((netMonthlyBeforeTax * taxRatePct) / 100);
  if (taxMinor > 0) {
    lines.push({ label: `Estimated tax (${taxRatePct}% )`, amountMinor: taxMinor, type: 'tax' });
  }

  const totalMinor = netMonthlyBeforeTax + taxMinor;
  lines.push({ label: 'Total (monthly)', amountMinor: totalMinor, type: 'total' });

  const annualPreDiscountMinor = totalMinor * 12;
  const annualDiscountMinor = input.billingCycle === 'annual' ? Math.round(annualPreDiscountMinor * 0.10) : 0;
  const annualTotalMinor = annualPreDiscountMinor - annualDiscountMinor;

  if (annualDiscountMinor > 0) {
    lines.push({ label: 'Annual prepay discount (10%)', amountMinor: -annualDiscountMinor, type: 'discount', description: 'Applied when billing annually' });
  }

  return {
    tier,
    basePriceMinor,
    currency: 'ZMW',
    billingCycle: input.billingCycle,
    lines,
    addOnTotalMinor,
    surchargeTotalMinor,
    discountTotalMinor,
    overageMinor,
    taxMinor,
    totalMinor,
    annualTotalMinor,
    promo: appliedPromo,
    trialRequested: input.trialRequested,
  };
}

function addonLabel(key: keyof TenantPricingInput['addOns']): string {
  switch (key) {
    case 'cifCalculator':
      return 'CIF calculator';
    case 'onlinePayments':
      return 'Online payments';
    case 'whatsappIntegration':
      return 'WhatsApp integration';
    case 'apiAccess':
      return 'API access';
    case 'multiWarehouse':
      return 'Multi-warehouse';
    case 'customerAccounts':
      return 'Customer accounts';
    default:
      return key;
  }
}
