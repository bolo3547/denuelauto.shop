import { z } from 'zod';

export const emailSchema = z.string().email();
export const passwordSchema = z.string().min(8).regex(/[a-z]/).regex(/[A-Z]/).regex(/[0-9]/);
export const otpSchema = z.string().length(6);
export const phoneZambia = z.string().regex(/^\+?260\s?\d{9}$/);
export const businessName = z.string().min(2);
export const currencyEnum = z.enum(['ZMW', 'USD']);
