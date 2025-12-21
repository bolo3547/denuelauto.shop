'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FaGoogle,
  FaFacebook,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaSpinner,
  FaPhone,
  FaUser,
  FaCheck,
  FaGlobe,
} from 'react-icons/fa';
import { useTenantTheme } from '@/components/public/tenant';
import { apiFetch } from '@/lib/config/api';

interface RegisterPageProps {
  tenantSlug: string;
}

export default function RegisterPage({ tenantSlug }: RegisterPageProps) {
  const router = useRouter();
  const { settings } = useTenantTheme();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: settings?.defaultCountry || '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
    subscribeNewsletter: true,
  });

  const countries: string[] = settings?.countries || [
    'Zambia', 'Zimbabwe', 'Malawi', 'DRC', 'Tanzania', 'Kenya', 
    'Mozambique', 'Botswana', 'South Africa', 'Other'
  ];

  const passwordStrength = (() => {
    const pwd = form.password;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!form.agreeTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }

    setLoading(true);

    try {
      if (!tenantSlug) {
        setError('Missing dealer information. Please refresh and try again.');
        return;
      }

      const res = await apiFetch('/api/auth/buyer/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantSlug,
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          country: form.country,
          password: form.password,
          acceptTerms: form.agreeTerms,
          subscribeNewsletter: form.subscribeNewsletter,
        }),
      });

      if (res.ok) {
        setStep(3); // Success step
      } else {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await res.json();
          setError(data.error || data.message || 'Registration failed');
        } else {
          const text = await res.text();
          setError(text || 'Registration failed');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          {settings?.logoUrl ? (
            <img src={settings.logoUrl} alt={settings.tenantName} className="h-12 mx-auto mb-4" />
          ) : (
            <h1 className="text-3xl font-bold text-[var(--accent)] mb-2">{settings?.tenantName || 'Denuel Auto'}</h1>
          )}
          <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
          <p className="text-gray-600 mt-1">Join us to save favorites, track inquiries & more</p>
        </div>

        {step === 3 ? (
          /* Success State */
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCheck className="text-green-500 text-3xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Registration Successful!</h3>
            <p className="text-gray-600 mb-6">
              Please check your email to verify your account. A confirmation link has been sent to {form.email}.
            </p>
            <Link
              href={`/t/${tenantSlug}/auth/login`}
              className="inline-block bg-[var(--accent)] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90"
            >
              Go to Login
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-6">
            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-4 mb-6">
              {[1, 2].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                      s <= step
                        ? 'bg-[var(--accent)] text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {s < step ? <FaCheck /> : s}
                  </div>
                  {s < 2 && (
                    <div
                      className={`w-16 h-1 ${s < step ? 'bg-[var(--accent)]' : 'bg-gray-200'}`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Social Login (Step 1 only) */}
            {step === 1 && (
              <>
                <div className="space-y-3 mb-6">
                  <button
                    type="button"
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 
                             rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <FaGoogle className="text-red-500" />
                    <span className="font-medium text-gray-700">Sign up with Google</span>
                  </button>
                  <button
                    type="button"
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 
                             rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <FaFacebook className="text-blue-600" />
                    <span className="font-medium text-gray-700">Sign up with Facebook</span>
                  </button>
                </div>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">Or register with email</span>
                  </div>
                </div>
              </>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {step === 1 && (
                <>
                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <div className="relative">
                        <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          required
                          value={form.firstName}
                          onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                          placeholder="John"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 
                                   focus:ring-[var(--accent)] focus:border-[var(--accent)]"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <input
                        id="lastName"
                        type="text"
                        required
                        value={form.lastName}
                        onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                        placeholder="Doe"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 
                                 focus:ring-[var(--accent)] focus:border-[var(--accent)]"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <div className="relative">
                      <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        id="email"
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 
                                 focus:ring-[var(--accent)] focus:border-[var(--accent)]"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <div className="relative">
                      <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        required
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+260 97X XXX XXX"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 
                                 focus:ring-[var(--accent)] focus:border-[var(--accent)]"
                      />
                    </div>
                  </div>

                  {/* Country */}
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <div className="relative">
                      <FaGlobe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <select
                        id="country"
                        required
                        value={form.country}
                        onChange={(e) => setForm({ ...form, country: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 
                                 focus:ring-[var(--accent)] focus:border-[var(--accent)] appearance-none"
                      >
                        <option value="">Select your country</option>
                        {countries.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!form.firstName || !form.lastName || !form.email || !form.phone || !form.country}
                    className="w-full bg-[var(--accent)] text-white py-3 rounded-lg font-semibold 
                             hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    Continue
                  </button>
                </>
              )}

              {step === 2 && (
                <>
                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <div className="relative">
                      <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        placeholder="Create a strong password"
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 
                                 focus:ring-[var(--accent)] focus:border-[var(--accent)]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    {/* Password Strength */}
                    <div className="mt-2 flex gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded ${
                            level <= passwordStrength
                              ? passwordStrength <= 2
                                ? 'bg-red-500'
                                : passwordStrength <= 3
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Use 8+ characters with uppercase, lowercase, numbers & symbols
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                    <div className="relative">
                      <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={form.confirmPassword}
                        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                        placeholder="Confirm your password"
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 
                                 focus:ring-[var(--accent)] focus:border-[var(--accent)] ${
                          form.confirmPassword && form.password !== form.confirmPassword
                            ? 'border-red-300'
                            : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {form.confirmPassword && form.password !== form.confirmPassword && (
                      <div className="text-xs text-red-500 mt-1">Passwords do not match</div>
                    )}
                  </div>

                  {/* Terms */}
                  <div className="space-y-3">
                    <label className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        checked={form.agreeTerms}
                        onChange={(e) => setForm({ ...form, agreeTerms: e.target.checked })}
                        className="w-4 h-4 mt-0.5 rounded border-gray-300 text-[var(--accent)] focus:ring-[var(--accent)]"
                      />
                      <span className="text-sm text-gray-600">
                        I agree to the{' '}
                        <Link href={`/t/${tenantSlug}/terms`} className="text-[var(--accent)] hover:underline">
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link href={`/t/${tenantSlug}/privacy`} className="text-[var(--accent)] hover:underline">
                          Privacy Policy
                        </Link>
                      </span>
                    </label>
                    <label className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        checked={form.subscribeNewsletter}
                        onChange={(e) => setForm({ ...form, subscribeNewsletter: e.target.checked })}
                        className="w-4 h-4 mt-0.5 rounded border-gray-300 text-[var(--accent)] focus:ring-[var(--accent)]"
                      />
                      <span className="text-sm text-gray-600">
                        Send me updates about new arrivals and special offers
                      </span>
                    </label>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold 
                               hover:bg-gray-200 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !form.agreeTerms || form.password !== form.confirmPassword}
                      className="flex-1 bg-[var(--accent)] text-white py-3 rounded-lg font-semibold 
                               hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading && <FaSpinner className="animate-spin" />}
                      {loading ? 'Creating...' : 'Create Account'}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        )}

        {/* Login Link */}
        {step !== 3 && (
          <p className="text-center mt-6 text-gray-600">
            Already have an account?{' '}
            <Link href={`/t/${tenantSlug}/auth/login`} className="text-[var(--accent)] font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
