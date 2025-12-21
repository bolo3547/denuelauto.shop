"use client";

import React, { useState } from "react";
import { useStaffAuth } from '@/hooks/useStaffAuth';

export default function StaffLoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const { loginWithToken } = useStaffAuth();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/staff/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      loginWithToken(data.token);
      // Redirect to dashboard for demo; ideally use tenant slug
      window.location.href = "/t/demo/admin";
    } catch (err: any) {
      setError(err.message);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <form className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md" onSubmit={handleSubmit}>
        <h1 className="text-2xl font-bold mb-6 text-center">Staff Login</h1>
        {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm mb-1">Email</label>
          <input id="email" type="email" className="w-full border rounded p-2" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-sm mb-1">Password</label>
          <input id="password" type="password" className="w-full border rounded p-2" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
        </div>
        <button type="submit" className="w-full py-2 rounded bg-blue-600 text-white font-semibold">Login</button>
      </form>
    </div>
  );
}
