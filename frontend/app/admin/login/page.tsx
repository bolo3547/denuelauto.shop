'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import StyledLoginForm from '@/components/StyledLoginForm';

export default function AdminLoginPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (email: string, password: string) => {
    setError('');
    setLoading(true);
    try {
      // Simplified login - in real app, call API
      if (email === 'admin@dealer.com' && password === 'admin123') {
        localStorage.setItem('admin_token', 'fake_token');
        router.push('/admin');
      } else {
        setError('Invalid credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <StyledLoginForm
        title="Dealer Admin Login"
        defaultEmail=""
        defaultPassword=""
        loading={loading}
        error={error}
        onSubmit={handleSubmit}
      />
    </div>
  );
}