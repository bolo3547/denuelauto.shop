import { emailSchema, passwordSchema, phoneZambia, otpSchema } from '../lib/validators';

describe('Validators', () => {
  it('validates email', () => {
    expect(emailSchema.parse('test@example.com')).toBe('test@example.com');
  });
  it('rejects bad email', () => {
    expect(() => emailSchema.parse('bademail')).toThrow();
  });
  it('validates strong password', () => {
    expect(passwordSchema.parse('Str0ngPass')).toBe('Str0ngPass');
  });
  it('validates zambia phone', () => {
    expect(phoneZambia.parse('+260971234567')).toBe('+260971234567');
  });
  it('validates otp length', () => {
    expect(otpSchema.parse('123456')).toBe('123456');
  });
});
