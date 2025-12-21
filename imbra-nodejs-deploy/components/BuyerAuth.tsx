import React, { useState } from 'react';
import { 
  FaUser, FaEnvelope, FaPhone, FaLock, FaEye, FaEyeSlash,
  FaMapMarkerAlt, FaDollarSign, FaCheck, FaGlobe
} from 'react-icons/fa';
import { makeApiUrl, apiFetch } from '@/lib/config/api';
import type { Buyer } from '@/types/buyer';

interface BuyerAuthProps {
  mode: 'login' | 'register';
  onSuccess: (buyer: Buyer) => void;
  onModeChange: (mode: 'login' | 'register') => void;
  tenantSlug: string;
}

export default function BuyerAuth({ mode, onSuccess, onModeChange, tenantSlug }: BuyerAuthProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    country: 'Zambia',
    city: '',
    budget: '',
    currency: 'USD',
    preferredMakes: [] as string[],
    acceptTerms: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [rawResponse, setRawResponse] = useState<string | null>(null);
  const [rawStatus, setRawStatus] = useState<number | null>(null);
  const [rawHeaders, setRawHeaders] = useState<Record<string, string> | null>(null);

  const carMakes = [
    'Toyota', 'Honda', 'Mazda', 'Lexus', 'BMW', 'Mercedes-Benz',
    'Audi', 'Volkswagen', 'Nissan', 'Mitsubishi', 'Subaru', 'Hyundai'
  ];

  const countries = [
    'Zambia', 'Kenya', 'Uganda', 'Tanzania', 'Botswana', 'Zimbabwe',
    'Malawi', 'Mozambique', 'South Africa', 'Rwanda', 'Ghana', 'Nigeria'
  ];

  const currencies = [
    { code: 'USD', name: 'US Dollar' },
    { code: 'ZMW', name: 'Zambian Kwacha' },
    { code: 'KES', name: 'Kenyan Shilling' },
    { code: 'UGX', name: 'Ugandan Shilling' },
    { code: 'TZS', name: 'Tanzanian Shilling' }
  ];

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (mode === 'register') {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      if (!formData.acceptTerms) {
        newErrors.acceptTerms = 'You must accept the terms and conditions';
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (mode === 'register' && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const endpoint = mode === 'login' ? makeApiUrl('/api/auth/login') : makeApiUrl('/api/auth/buyer/register');

      const payload = mode === 'login'
        ? {
            tenantSlug,
            email: formData.email,
            password: formData.password,
            loginType: 'buyer'
          }
        : {
            tenantSlug,
            ...formData,
            budget: formData.budget ? parseFloat(formData.budget) : null
          };

      const response = await apiFetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const text = await response.text();
      // capture status & headers for debugging
      try {
        setRawStatus(response.status);
        const h: Record<string, string> = {};
        response.headers.forEach((v, k) => (h[k] = v));
        setRawHeaders(h);
      } catch (e) {
        // ignore header capture failures
      }

      // Try to parse JSON; if the server returned HTML (e.g., 404 page) this will throw
      interface AuthResponse {
        token?: string;
        buyer?: Record<string, unknown>;
        user?: Record<string, unknown>;
        error?: string;
        [key: string]: unknown;
      }
      let data: AuthResponse;
      try {
        data = JSON.parse(text);
        // clear any previous raw response
        setRawResponse(null);
      } catch (err) {
        console.error('Non-JSON response from auth endpoint:', text.slice(0, 300));
        // Save raw response for debugging in development
        if (process.env.NODE_ENV !== 'production') setRawResponse(text);
        setErrors({ general: 'Authentication service returned an unexpected response' });
        return;
      }

      if (!response.ok) {
        setErrors({ general: data.error || 'Authentication failed' });
        return;
      }

      // Support different response shapes: { token, buyer } or { token, user }
      const buyerData = data.user || data.buyer || data;

      const meResponse = await fetch(makeApiUrl('/api/auth/me'), {
        method: 'GET',
        credentials: 'include'
      });
      const meData = meResponse.ok ? await meResponse.json() : null;
      const profile = meData?.user || buyerData;

      onSuccess(profile);
    } catch (error) {
      console.error('Auth error:', error);
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleMakeToggle = (make: string) => {
    setFormData(prev => ({
      ...prev,
      preferredMakes: prev.preferredMakes.includes(make)
        ? prev.preferredMakes.filter(m => m !== make)
        : [...prev.preferredMakes, make]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => onModeChange(mode === 'login' ? 'register' : 'login')}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              {mode === 'login' ? 'Register here' : 'Sign in here'}
            </button>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errors.general && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {errors.general}
            </div>
          )}

          <div className="space-y-4">
            {mode === 'register' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <div className="mt-1 relative">
                      <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        id="firstName"
                        type="text"
                        autoComplete="given-name"
                        value={formData.firstName}
                        onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                        className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="First name"
                      />
                    </div>
                    {errors.firstName && <p className="text-red-600 text-xs mt-1">{errors.firstName}</p>}
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <div className="mt-1 relative">
                      <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        id="lastName"
                        type="text"
                        autoComplete="family-name"
                        value={formData.lastName}
                        onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                        className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Last name"
                      />
                    </div>
                    {errors.lastName && <p className="text-red-600 text-xs mt-1">{errors.lastName}</p>}
                  </div>
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="mt-1 relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Email address"
                />
              </div>
              {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
            </div>

            {mode === 'register' && (
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <div className="mt-1 relative">
                  <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+260977123456"
                  />
                </div>
                {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone}</p>}
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="appearance-none relative block w-full pl-10 pr-10 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Password"
                  name="password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  title={showPassword ? "Hide password" : "Show password"}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password}</p>}
            </div>

            {mode === 'register' && (
              <>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <div className="mt-1 relative">
                    <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      id="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Confirm password"
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-red-600 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                      Country
                    </label>
                    <div className="mt-1 relative">
                      <FaGlobe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <select
                        id="country"
                        value={formData.country}
                        onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                        className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        {countries.map(country => (
                          <option key={country} value={country}>{country}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                      City
                    </label>
                    <div className="mt-1 relative">
                      <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        id="city"
                        type="text"
                        autoComplete="address-level2"
                        value={formData.city}
                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                        className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="City"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
                      Budget (Optional)
                    </label>
                    <div className="mt-1 relative">
                      <FaDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        id="budget"
                        type="number"
                        value={formData.budget}
                        onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                        className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="25000"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                      Currency
                    </label>
                    <select
                      id="currency"
                      value={formData.currency}
                      onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {currencies.map(currency => (
                        <option key={currency.code} value={currency.code}>
                          {currency.code} - {currency.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <fieldset>
                  <legend className="block text-sm font-medium text-gray-700 mb-3">
                    Preferred Car Makes (Optional)
                  </legend>
                  <div className="grid grid-cols-3 gap-2">
                    {carMakes.map(make => (
                      <label key={make} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.preferredMakes.includes(make)}
                          onChange={() => handleMakeToggle(make)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{make}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div className="flex items-start">
                  <input
                    id="acceptTerms"
                    type="checkbox"
                    checked={formData.acceptTerms}
                    onChange={(e) => setFormData(prev => ({ ...prev, acceptTerms: e.target.checked }))}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-900">
                    I accept the{' '}
                    <a href="/terms" target="_blank" className="text-blue-600 hover:text-blue-500">
                      Terms and Conditions
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" target="_blank" className="text-blue-600 hover:text-blue-500">
                      Privacy Policy
                    </a>
                  </label>
                </div>
                {errors.acceptTerms && <p className="text-red-600 text-xs mt-1">{errors.acceptTerms}</p>}
              </>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </div>
              ) : (
                <>
                  {mode === 'login' ? 'Sign in' : 'Create Account'}
                  <FaCheck className="ml-2" />
                </>
              )}
            </button>
          </div>

          {mode === 'login' && (
            <div className="text-center">
              <a href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
                Forgot your password?
              </a>
            </div>
          )}
        </form>

        {/* Dev debug panel for raw non-JSON responses */}
        {process.env.NODE_ENV !== 'production' && rawResponse && (
          <div className="mt-4 p-3 bg-black text-white rounded-md text-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">Auth Debug (dev only)</div>
              <div className="space-x-2">
                <button
                  onClick={async () => {
                    try {
                      if (typeof navigator !== 'undefined' && navigator.clipboard) await navigator.clipboard.writeText(rawResponse || '');
                    } catch (e) {
                      // intentionally ignored
                    }
                  }}
                  className="px-2 py-1 bg-blue-600 rounded hover:bg-blue-700"
                >
                  Copy
                </button>
                <button
                  onClick={() => { setRawResponse(null); setRawStatus(null); setRawHeaders(null); }}
                  className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="mb-2">Status: <span className="font-mono">{rawStatus}</span></div>
            <div className="mb-2">Headers:
              <pre className="max-h-28 overflow-auto bg-black text-white text-xs p-2 rounded mt-1">{JSON.stringify(rawHeaders, null, 2)}</pre>
            </div>
            <div>Body:</div>
            <pre className="max-h-48 overflow-auto bg-black text-white text-xs p-2 rounded mt-1">{rawResponse}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
