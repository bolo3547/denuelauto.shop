// Minimal frontend service to call the backend OpenChat APIs
import { makeApiUrl } from '@/lib/config/api';

type SuggestCarRequest = { preferences?: any; tenantId?: string };
type TenantLearnRequest = { tenantId: string; tenantData: any };
type ReminderRequest = { tenantId: string; reminderText: string; date?: string };
type AccountingRequest = { tenantId?: string; calcPrompt: string };

async function callApi(path: string, body: any) {
  const url = makeApiUrl(path);
  const resp = await fetch(url, { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } });
  if (!resp.ok) throw new Error(`OpenChat API error: ${resp.status}`);
  return resp.json();
}

export async function suggestCar(req: SuggestCarRequest) {
  return callApi('/api/openchat/suggest-car', req);
}

export async function tenantLearn(req: TenantLearnRequest) {
  return callApi('/api/openchat/tenant-learn', req);
}

export async function createReminder(req: ReminderRequest) {
  return callApi('/api/openchat/reminder', req);
}

export async function accountingHelp(req: AccountingRequest) {
  return callApi('/api/openchat/accounting', req);
}

export default { suggestCar, tenantLearn, createReminder, accountingHelp };
