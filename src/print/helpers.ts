import QRCode from 'qrcode';
import Decimal from 'decimal.js';
import crypto from 'crypto';

export const formatMoney = (value: number | string | Decimal, currency = 'U.SD') => {
  const d = new Decimal(value as any);
  return `${d.toFixed(2)} ${currency}`;
};

export const dateFmt = (iso?: string | Date) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toISOString().split('T')[0];
};

export const upper = (s?: string) => (s || '').toUpperCase();
export const lower = (s?: string) => (s || '').toLowerCase();
export const percent = (p?: number) => (p || 0) + '%';
export const eq = (a: any, b: any) => a === b;
export const neq = (a: any, b: any) => a !== b;
export const sum = (a: number | string | Decimal, b: number | string | Decimal) => {
  return new Decimal(a as any).plus(new Decimal(b as any)).toNumber();
};
export const mul = (a: number | string | Decimal, b: number | string | Decimal) => {
  return new Decimal(a as any).times(new Decimal(b as any)).toNumber();
};
export const json = (obj: any) => JSON.stringify(obj, null, 2);

export const ifPaid = (status?: string) => status === 'paid' || status === 'part_paid';

export const cifBreakdown = (fob = 0, freight = 0, insuranceRatePct = 0, other = 0) => {
  const fobD = new Decimal(fob);
  const freightD = new Decimal(freight);
  const insurance = fobD.times(new Decimal(insuranceRatePct || 0)).dividedBy(100);
  const otherD = new Decimal(other || 0);
  const total = fobD.plus(freightD).plus(insurance).plus(otherD);
  return {
    rows: [
      { label: 'FOB', amount: fobD.toNumber() },
      { label: 'Freight', amount: freightD.toNumber() },
      { label: 'Insurance', amount: insurance.toNumber() },
      { label: 'Other', amount: otherD.toNumber() },
    ],
    total: total.toNumber(),
  };
};

export const qrcode = async (data: string) => {
  try {
    const url = await QRCode.toDataURL(data, { errorCorrectionLevel: 'H' });
    return url;
  } catch (err) {
    return '';
  }
};

export const watermark = (status?: string) => (!ifPaid(status) ? 'DRAFT' : '');

export const computeHash = (str: string) => {
  const h = crypto.createHash('sha256').update(str).digest('hex');
  return h;
};

export default {
  formatMoney,
  dateFmt,
  upper,
  lower,
  percent,
  eq,
  neq,
  sum,
  mul,
  json,
  ifPaid,
  cifBreakdown,
  qrcode,
  computeHash,
  watermark,
};
