'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  FaCar, 
  FaEnvelope, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaSpinner,
  FaUserShield,
  FaStore,
  FaUserTie,
  FaUser
} from 'react-icons/fa';
import { saveAuthSession, getAuthSession, getRedirectPath, AuthUser, AuthSession } from '@/lib/auth-client';

type LoginType = 'all' | 'super_admin' | 'tenant' | 'buyer';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginType, setLoginType] = useState<LoginType>('all');
  const tenantSlug = searchParams?.get('tenant') ?? '';
  const redirectTo = searchParams?.get('redirect') ?? '';

  useEffect(() => {
    // Check if already logged in
    const session = getAuthSession();
    if (session) {
      const redirectPath = redirectTo || getRedirectPath(session.user);
      router.push(redirectPath);
    }
  }, [router, redirectTo]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Single unified login endpoint
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password,
          loginType: loginType === 'all' ? undefined : loginType,
          tenantSlug
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid email or password');
      }

      // Create auth session
      const user: AuthUser = {
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.fullName || data.user.name || 'User',
        role: data.user.role,
        type: data.user.type,
        tenantId: data.user.tenantId,
        tenantSlug: data.user.tenantSlug || tenantSlug,
        tenantName: data.user.tenantName,
        permissions: data.user.permissions,
      };

      const session: AuthSession = {
        token: data.token,
        user,
        expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      };

      saveAuthSession(session);

      // Redirect based on user type
      const redirectPath = redirectTo || getRedirectPath(user);
      router.push(redirectPath);

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Login failed. Please try again.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (type: 'super_admin' | 'tenant_admin' | 'agent' | 'buyer') => {
    switch (type) {
      case 'super_admin':
        setEmail('denuelinambao@gmail.com');
        setPassword('please-change-me');
        setLoginType('super_admin');
        break;
      case 'tenant_admin':
        setEmail('admin@sample-dealer.com');
        setPassword('password123');
        setLoginType('tenant');
        break;
      case 'agent':
        setEmail('agent@sample-dealer.com');
        setPassword('password123');
        setLoginType('tenant');
        break;
      case 'buyer':
        setEmail('buyer@example.com');
        setPassword('password123');
        setLoginType('buyer');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/30">
            <FaCar className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Denuel Auto</h1>
          <p className="text-blue-200">Sign in to your account</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20">
          {/* Login Type Selector */}
          <div className="mb-6">
            <div className="grid grid-cols-4 gap-2 p-1 bg-white/5 rounded-lg">
              {[
                { id: 'all', icon: FaUser, label: 'All' },
                { id: 'super_admin', icon: FaUserShield, label: 'HQ' },
                { id: 'tenant', icon: FaStore, label: 'Dealer' },
                { id: 'buyer', icon: FaUserTie, label: 'Buyer' },
              ].map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setLoginType(type.id as LoginType)}
                  className={`flex flex-col items-center py-2 px-2 rounded-md transition-all text-xs ${
                    loginType === type.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-blue-200 hover:bg-white/10'
                  }`}
                >
                  <type.icon className="w-4 h-4 mb-1" />
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-blue-200 mb-2">
                Email Address
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300 w-4 h-4" />
                <input id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-blue-200 mb-2">
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300 w-4 h-4" />
                <input id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-300 hover:text-white transition-colors"
                >
                  {showPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label htmlFor="remember-me" className="flex items-center text-blue-200">
                <input id="remember-me"
                  type="checkbox"
                  className="w-4 h-4 rounded border-white/20 bg-white/10 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-blue-400 hover:text-blue-300 transition-colors">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <FaSpinner className="w-5 h-5 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-center text-blue-300 text-sm mb-3">Quick Demo Login</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemoCredentials('super_admin')}
                className="py-2 px-3 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-300 hover:bg-purple-500/30 transition-colors text-xs flex items-center justify-center gap-1"
              >
                <FaUserShield className="w-3 h-3" />
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => fillDemoCredentials('tenant_admin')}
                className="py-2 px-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300 hover:bg-green-500/30 transition-colors text-xs flex items-center justify-center gap-1"
              >
                <FaStore className="w-3 h-3" />
                Dealer Admin
              </button>
              <button
                type="button"
                onClick={() => fillDemoCredentials('agent')}
                className="py-2 px-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-300 hover:bg-yellow-500/30 transition-colors text-xs flex items-center justify-center gap-1"
              >
                <FaUserTie className="w-3 h-3" />
                Agent
              </button>
              <button
                type="button"
                onClick={() => fillDemoCredentials('buyer')}
                className="py-2 px-3 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 hover:bg-blue-500/30 transition-colors text-xs flex items-center justify-center gap-1"
              >
                <FaUser className="w-3 h-3" />
                Buyer
              </button>
            </div>
          </div>

          {/* Sign Up Link */}
          <p className="mt-6 text-center text-blue-200 text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Sign up
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-blue-300/50 text-xs mt-6">
          © 2024 Denuel Auto. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900"><FaSpinner className="animate-spin text-4xl text-white" /></div>}>
      <LoginPageContent />
    </Suspense>
  );
}
