import axios from 'axios';
import { Car } from '../types/car';
import { getApiBaseUrl } from '@/lib/config/api';

const baseURL = getApiBaseUrl({ allowBrowserFallback: true });
const api = axios.create({ baseURL: baseURL || undefined });
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token && config.headers) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

export default api;

export function normalizeCars(data: unknown): Car[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as Car[];
  // @ts-ignore - the structure could be any; try common props
  if (data && Array.isArray((data as any).cars)) return (data as any).cars as Car[];
  // @ts-ignore
  if (data && Array.isArray((data as any).list)) return (data as any).list as Car[];
  // @ts-ignore
  if (data && Array.isArray((data as any).results)) return (data as any).results as Car[];
  // common wrapper
  // @ts-ignore
  if (data && Array.isArray((data as any).data)) return (data as any).data as Car[];
  return [];
}
