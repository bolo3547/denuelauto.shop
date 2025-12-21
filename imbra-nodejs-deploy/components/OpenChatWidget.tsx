import React, { useState } from 'react';
import openchatService from '../services/openchatService';

export default function OpenChatWidget() {
  const [preferences, setPreferences] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function handleSuggest(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const resp = await openchatService.suggestCar({ preferences: { text: preferences } });
      setResult(resp);
    } catch (err) {
      setResult({ error: String(err) });
    } finally { setLoading(false); }
  }

  return (
    <div className="border p-4 rounded">
      <h3 className="font-bold">OpenChat - Car Suggest</h3>
      <form onSubmit={handleSuggest}>
        <textarea value={preferences} onChange={(e) => setPreferences(e.target.value)} placeholder="Enter car preferences like budget, type, seats..." className="w-full p-2 mb-2" />
        <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Thinking...' : 'Get suggestions'}</button>
      </form>
      {result && (
        <pre className="mt-2 text-sm bg-gray-100 p-2 overflow-auto">{JSON.stringify(result, null, 2)}</pre>
      )}
    </div>
  );
}
