"use client";
import React, { useState } from 'react';
import ActionButton from '../../../components/ActionButton';
import telemetry from '../../../lib/telemetry';
import { makeApiUrl } from '@/lib/config/api';

export default function TestButtonPage() {
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    // simulate network op and call telemetry
    telemetry.track('test_button_clicked');
    await fetch(makeApiUrl('/api/events'), { method: 'POST', body: JSON.stringify({ event: 'test_button_clicked' }) });
    await new Promise((res) => setTimeout(res, 300));
    setSaved(true);
  }

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold mb-4">Test ActionButton</h1>
      <ActionButton onClick={handleSave} data-testid="test-action-btn">Save</ActionButton>
      {saved && <div className="mt-4 text-green-600">Saved!</div>}
    </div>
  );
}
