import axios from 'axios';
import secrets from '../config/secrets';

// Simple axios wrapper configured to call an external admin API using ADMIN_API_KEY.
// Use it only server-side (and protect routes that call it with HQ auth middleware).
const adminApiClient = axios.create({
  baseURL: secrets.ADMIN_API_BASE_URL || 'https://admin.example/v1',
  timeout: 10000,
});

// Add Authorization header interceptor if API key configured
adminApiClient.interceptors.request.use((config) => {
  if (!config.headers) config.headers = {};
  if (secrets.ADMIN_API_KEY) {
    config.headers['Authorization'] = `Bearer ${secrets.ADMIN_API_KEY}`;
  }
  return config;
});

export default adminApiClient;
