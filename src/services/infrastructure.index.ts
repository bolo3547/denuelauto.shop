// =====================================================
// NATIONAL AUTOMOTIVE INFRASTRUCTURE SERVICES
// Main export file for all strategic services
// =====================================================

// Priority 1: National Dealer Network
export { networkService } from './network.service';
export { globalBuyerService } from './global-buyer.service';

// Priority 2: Market Intelligence & AI Pricing
export { marketIntelligenceService } from './market-intelligence.service';

// Priority 3: Financing Partner Integration
export { financingService } from './financing.service';

// Supporting Services
export { dealerVerificationService } from './dealer-verification.service';
export { marketingService } from './marketing-automation.service';

// Type exports for API consumers
export type {
  // Network types would go here
} from './network.service';

// =====================================================
// SERVICE INITIALIZATION
// =====================================================

/**
 * Initialize all background jobs
 * Call this from your main server startup
 */
export async function initializeInfrastructureServices() {
  console.log('🚀 Initializing National Automotive Infrastructure Services...');
  
  // These would typically be scheduled jobs
  const jobs = [
    'Market Data Aggregation (daily)',
    'Market Insights Generation (daily)',
    'Verification Expiry Check (daily)',
    'Social Post Queue Processing (every 5 minutes)',
    'Search Analytics Aggregation (hourly)'
  ];
  
  console.log('📋 Scheduled jobs to configure:');
  jobs.forEach(job => console.log(`   - ${job}`));
  
  console.log('✅ Infrastructure services ready');
}

// =====================================================
// API ROUTE HELPERS
// =====================================================

/**
 * Standard API response format
 */
export function apiResponse<T>(success: boolean, data?: T, error?: string) {
  return {
    success,
    ...(data && { data }),
    ...(error && { error }),
    timestamp: new Date().toISOString()
  };
}

/**
 * Pagination helper
 */
export function paginate<T>(items: T[], page: number = 1, limit: number = 20) {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  return {
    items: items.slice(startIndex, endIndex),
    pagination: {
      page,
      limit,
      total: items.length,
      pages: Math.ceil(items.length / limit),
      hasNext: endIndex < items.length,
      hasPrev: page > 1
    }
  };
}
