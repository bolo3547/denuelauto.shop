"use client";

import React, { useState } from 'react';
import useHqAdminAuth from '@/hooks/useHqAdminAuth';
import StyledLoginForm from '@/components/StyledLoginForm';

export default function HqLoginPage() {
  const [email, setEmail] = useState('admin@denuel.com');
  const [password, setPassword] = useState('admin1234');
  const { login, loading, error } = useHqAdminAuth();

  const handleSubmit = async (eMail: string, pwd: string) => {
    // keep local state in sync for defaults
    setEmail(eMail);
    setPassword(pwd);
    await login(eMail, pwd);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <StyledLoginForm
        title="Denuel HQ Login"
        defaultEmail={email}
        defaultPassword={password}
        loading={loading}
        error={error}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
