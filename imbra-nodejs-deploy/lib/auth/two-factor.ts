/**
 * Two-Factor Authentication (2FA) Service
 * TOTP-based authentication with backup codes
 */

import crypto from 'crypto';

// Constants
const TOTP_DIGITS = 6;
const TOTP_PERIOD = 30; // seconds
const TOTP_ALGORITHM = 'sha1';
const BACKUP_CODES_COUNT = 10;
const BACKUP_CODE_LENGTH = 8;

export interface TwoFactorSecret {
  base32: string;
  otpauthUrl: string;
  qrCodeDataUrl?: string;
}

export interface TwoFactorConfig {
  issuer: string;
  accountName: string;
}

export interface BackupCode {
  code: string;
  usedAt?: Date;
}

export interface TwoFactorStatus {
  enabled: boolean;
  enabledAt?: Date;
  method: '2fa_totp' | '2fa_sms' | 'none';
  backupCodesRemaining?: number;
}

// Base32 encoding alphabet
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Encode buffer to base32
 */
function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = '';

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;

    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
}

/**
 * Decode base32 to buffer
 */
function base32Decode(encoded: string): Buffer {
  const cleaned = encoded.toUpperCase().replace(/[=\s]/g, '');
  const output: number[] = [];
  let bits = 0;
  let value = 0;

  for (let i = 0; i < cleaned.length; i++) {
    const index = BASE32_ALPHABET.indexOf(cleaned[i]);
    if (index === -1) continue;

    value = (value << 5) | index;
    bits += 5;

    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(output);
}

/**
 * Generate a random secret key
 */
export function generateSecret(length: number = 20): string {
  const buffer = crypto.randomBytes(length);
  return base32Encode(buffer);
}

/**
 * Generate TOTP secret with QR code URL
 */
export function generateTwoFactorSecret(config: TwoFactorConfig): TwoFactorSecret {
  const secret = generateSecret();
  
  const otpauthUrl = [
    'otpauth://totp/',
    encodeURIComponent(config.issuer),
    ':',
    encodeURIComponent(config.accountName),
    '?secret=',
    secret,
    '&issuer=',
    encodeURIComponent(config.issuer),
    '&algorithm=',
    TOTP_ALGORITHM.toUpperCase(),
    '&digits=',
    TOTP_DIGITS,
    '&period=',
    TOTP_PERIOD,
  ].join('');

  return {
    base32: secret,
    otpauthUrl,
  };
}

/**
 * Generate HMAC-based counter
 */
function hmacCounter(secret: Buffer, counter: number): Buffer {
  const counterBuffer = Buffer.alloc(8);
  for (let i = 7; i >= 0; i--) {
    counterBuffer[i] = counter & 0xff;
    counter = Math.floor(counter / 256);
  }

  const hmac = crypto.createHmac(TOTP_ALGORITHM, secret);
  hmac.update(counterBuffer);
  return hmac.digest();
}

/**
 * Generate TOTP code from secret
 */
export function generateTOTP(secret: string, timestamp?: number): string {
  const time = timestamp || Math.floor(Date.now() / 1000);
  const counter = Math.floor(time / TOTP_PERIOD);
  
  const secretBuffer = base32Decode(secret);
  const hmacResult = hmacCounter(secretBuffer, counter);
  
  // Dynamic truncation
  const offset = hmacResult[hmacResult.length - 1] & 0x0f;
  const code =
    ((hmacResult[offset] & 0x7f) << 24) |
    ((hmacResult[offset + 1] & 0xff) << 16) |
    ((hmacResult[offset + 2] & 0xff) << 8) |
    (hmacResult[offset + 3] & 0xff);
  
  const otp = code % Math.pow(10, TOTP_DIGITS);
  return otp.toString().padStart(TOTP_DIGITS, '0');
}

/**
 * Verify TOTP code with time window tolerance
 */
export function verifyTOTP(
  secret: string,
  token: string,
  window: number = 1
): { valid: boolean; delta: number } {
  const time = Math.floor(Date.now() / 1000);
  
  // Check tokens within the window
  for (let i = -window; i <= window; i++) {
    const checkTime = time + (i * TOTP_PERIOD);
    const expectedToken = generateTOTP(secret, checkTime);
    
    if (constantTimeCompare(token, expectedToken)) {
      return { valid: true, delta: i };
    }
  }
  
  return { valid: false, delta: 0 };
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}

/**
 * Generate backup codes
 */
export function generateBackupCodes(count: number = BACKUP_CODES_COUNT): BackupCode[] {
  const codes: BackupCode[] = [];
  
  for (let i = 0; i < count; i++) {
    const randomBytes = crypto.randomBytes(Math.ceil(BACKUP_CODE_LENGTH / 2));
    const code = randomBytes.toString('hex').slice(0, BACKUP_CODE_LENGTH).toUpperCase();
    
    // Format as XXXX-XXXX
    const formattedCode = `${code.slice(0, 4)}-${code.slice(4)}`;
    codes.push({ code: formattedCode });
  }
  
  return codes;
}

/**
 * Hash backup code for storage
 */
export function hashBackupCode(code: string): string {
  return crypto
    .createHash('sha256')
    .update(code.replace(/-/g, '').toUpperCase())
    .digest('hex');
}

/**
 * Verify backup code
 */
export function verifyBackupCode(
  inputCode: string,
  hashedCodes: { hash: string; used: boolean }[]
): { valid: boolean; index: number } {
  const inputHash = hashBackupCode(inputCode);
  
  for (let i = 0; i < hashedCodes.length; i++) {
    if (!hashedCodes[i].used && constantTimeCompare(inputHash, hashedCodes[i].hash)) {
      return { valid: true, index: i };
    }
  }
  
  return { valid: false, index: -1 };
}

/**
 * Generate SMS OTP code
 */
export function generateSMSOTP(length: number = 6): string {
  const max = Math.pow(10, length);
  const min = Math.pow(10, length - 1);
  const code = crypto.randomInt(min, max);
  return code.toString();
}

/**
 * Create OTP expiry time
 */
export function createOTPExpiry(minutes: number = 5): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
}

/**
 * Check if OTP is expired
 */
export function isOTPExpired(expiry: Date): boolean {
  return new Date() > expiry;
}

/**
 * Rate limiting helper for OTP attempts
 */
export interface OTPAttempt {
  count: number;
  firstAttempt: Date;
  lockedUntil?: Date;
}

export function checkOTPRateLimit(
  attempt: OTPAttempt | null,
  maxAttempts: number = 5,
  windowMinutes: number = 15,
  lockoutMinutes: number = 30
): { allowed: boolean; remainingAttempts: number; lockedUntil?: Date } {
  const now = new Date();
  
  // No previous attempts
  if (!attempt) {
    return { allowed: true, remainingAttempts: maxAttempts - 1 };
  }
  
  // Check if locked out
  if (attempt.lockedUntil && now < attempt.lockedUntil) {
    return {
      allowed: false,
      remainingAttempts: 0,
      lockedUntil: attempt.lockedUntil,
    };
  }
  
  // Check if window has expired
  const windowExpiry = new Date(attempt.firstAttempt.getTime() + windowMinutes * 60 * 1000);
  if (now > windowExpiry) {
    return { allowed: true, remainingAttempts: maxAttempts - 1 };
  }
  
  // Check if max attempts exceeded
  if (attempt.count >= maxAttempts) {
    const lockedUntil = new Date(now.getTime() + lockoutMinutes * 60 * 1000);
    return {
      allowed: false,
      remainingAttempts: 0,
      lockedUntil,
    };
  }
  
  return {
    allowed: true,
    remainingAttempts: maxAttempts - attempt.count - 1,
  };
}

/**
 * Generate recovery key (for account recovery)
 */
export function generateRecoveryKey(): string {
  const bytes = crypto.randomBytes(32);
  const key = bytes.toString('hex');
  
  // Format as groups of 4 characters
  return key.match(/.{1,4}/g)?.join('-').toUpperCase() || key.toUpperCase();
}

/**
 * Two-Factor Authentication class for managing user 2FA
 */
export class TwoFactorAuth {
  private issuer: string;

  constructor(issuer: string) {
    this.issuer = issuer;
  }

  /**
   * Setup 2FA for a user
   */
  setup(accountName: string): TwoFactorSecret {
    return generateTwoFactorSecret({
      issuer: this.issuer,
      accountName,
    });
  }

  /**
   * Verify 2FA token
   */
  verify(secret: string, token: string): boolean {
    const result = verifyTOTP(secret, token);
    return result.valid;
  }

  /**
   * Generate backup codes
   */
  generateBackups(): BackupCode[] {
    return generateBackupCodes();
  }

  /**
   * Hash backup codes for storage
   */
  hashBackups(codes: BackupCode[]): { hash: string; used: boolean }[] {
    return codes.map(code => ({
      hash: hashBackupCode(code.code),
      used: code.usedAt !== undefined,
    }));
  }

  /**
   * Verify backup code
   */
  verifyBackup(
    inputCode: string,
    hashedCodes: { hash: string; used: boolean }[]
  ): { valid: boolean; index: number } {
    return verifyBackupCode(inputCode, hashedCodes);
  }
}

// Export utilities
export default {
  generateSecret,
  generateTwoFactorSecret,
  generateTOTP,
  verifyTOTP,
  generateBackupCodes,
  hashBackupCode,
  verifyBackupCode,
  generateSMSOTP,
  createOTPExpiry,
  isOTPExpired,
  checkOTPRateLimit,
  generateRecoveryKey,
  TwoFactorAuth,
};
