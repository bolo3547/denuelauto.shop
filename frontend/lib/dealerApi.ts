// api.ts
import { DealerPayload } from '../types/dealer';

export async function createDealerTenant(payload: DealerPayload): Promise<{ success: boolean; tenantId?: string }> {
  // Mocked API call
  console.log('Creating dealer tenant:', payload);
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
  return { success: true, tenantId: `tenant-${Date.now()}` };
}