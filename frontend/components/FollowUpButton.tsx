import React, { useState } from 'react';
import { sendFollowUp } from '../services/messagingService';

export default function FollowUpButton({ to }: { to: string }) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    setLoading(true);
    setError(null);
    try {
      await sendFollowUp({ to, message: 'Thank you for your interest! We will follow up soon.' });
      setSent(true);
    } catch (e) {
      setError('Failed to send message');
    }
    setLoading(false);
  }

  return (
    <button onClick={handleSend} disabled={loading || sent} className="px-4 py-2 bg-green-600 text-white rounded">
      {loading ? 'Sending...' : sent ? 'Sent!' : 'Send WhatsApp/SMS Follow-up'}
    </button>
  );
}
