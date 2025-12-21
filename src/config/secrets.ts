// Centralized place to access sensitive environment variables (server-only)
// NOTE: Keep these secrets in environment variables or a secret manager. Do NOT expose them to the client.
export const ADMIN_API_KEY = process.env.ADMIN_API_KEY || '';
export const ADMIN_API_BASE_URL = process.env.ADMIN_API_BASE_URL || '';
export const OPENCHAT_API_KEY = process.env.OPENCHAT_API_KEY || '';
export const AWS_BEARER_TOKEN_BEDROCK = process.env.AWS_BEARER_TOKEN_BEDROCK || '';
export const HQ_JWT_SECRET = process.env.HQ_JWT_SECRET || '';

export default {
  ADMIN_API_KEY,
  ADMIN_API_BASE_URL,
  OPENCHAT_API_KEY,
  AWS_BEARER_TOKEN_BEDROCK,
  HQ_JWT_SECRET,
};
