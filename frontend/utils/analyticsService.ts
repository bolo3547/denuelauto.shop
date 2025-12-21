// Mock analytics data for dashboard
export function getAnalytics() {
  return {
    sales: 120,
    leads: 340,
    inventory: 56,
    agentPerformance: [
      { name: 'Alice', deals: 30 },
      { name: 'Bob', deals: 22 },
      { name: 'Carol', deals: 18 },
    ],
    marketingROI: 3.2, // ROI multiplier
  };
}
