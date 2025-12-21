export function moneyZMW(n: number){
  return `${n.toLocaleString()} ZMW`;
}
export function moneyUSD(n: number){
  return `$${n.toLocaleString()}`;
}
export function moneyJPY(n: number){
  // No decimal for JPY, use Intl for proper grouping
  try {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }).format(n);
  } catch (e) {
    return `¥${Math.round(n).toLocaleString()}`;
  }
}

export function convertUsdToJpy(amountUsd: number, usdToJpyRate: number | null){
  if (!usdToJpyRate || isNaN(usdToJpyRate)) return Math.round(amountUsd * 150); // fallback rate
  return Math.round(amountUsd * usdToJpyRate);
}
