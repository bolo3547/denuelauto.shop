// Simple financing calculator
export function calculateMonthlyPayment({ price, downPayment = 0, interestRate = 18, years = 3 }: {
  price: number;
  downPayment?: number;
  interestRate?: number; // annual percentage
  years?: number;
}) {
  const principal = price - downPayment;
  const monthlyRate = interestRate / 100 / 12;
  const n = years * 12;
  if (monthlyRate === 0) return principal / n;
  const payment = (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -n));
  return Math.round(payment * 100) / 100;
}
