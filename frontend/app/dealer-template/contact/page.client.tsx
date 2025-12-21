"use client";
import React, { useState } from 'react';
import { tenantTheme } from '../../../lib/tenantMock';
import Breadcrumbs from '@/components/Breadcrumbs';
import PageAnalytics from '@/components/PageAnalytics';

export default function ContactPageClient(){
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  function onSubmit(e: React.FormEvent){
    e.preventDefault();
    console.log('Contact form submitted', form);
    alert('Message sent (mock)');
    setForm({ name: '', email: '', subject: '', message: '' });
  }
  return (
    <div className="max-w-3xl">
      <PageAnalytics pageName="Contact" />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Contact' }]} />
      <h2 className="text-lg font-semibold mb-4">Contact {tenantTheme.name}</h2>
      <div className="bg-white p-4 rounded border shadow-sm">
        <div className="text-sm text-gray-600">{tenantTheme.location} • {tenantTheme.phone} • {tenantTheme.email}</div>
        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <input className="border p-2 rounded w-full" placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <input className="border p-2 rounded w-full" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          <input className="border p-2 rounded w-full" placeholder="Subject" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} />
          <textarea placeholder="Message" value={form.message} onChange={e => setForm({...form, message: e.target.value})} className="border p-2 rounded w-full h-32" />
          <button className="px-4 py-2 rounded bg-blue-600 text-white">Send message</button>
        </form>
      </div>
    </div>
  );
}
