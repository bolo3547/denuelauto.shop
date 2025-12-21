"use client";

import React, { useState } from 'react';
import { scheduleVideoTour } from '../services/videoTourService';

export default function VideoTourScheduler({ carId, hostId }: { carId: string; hostId: string }) {
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [scheduled, setScheduled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSchedule() {
    setLoading(true);
    setError(null);
    try {
      await scheduleVideoTour({ carId, hostId, scheduledAt: date });
      setScheduled(true);
    } catch (e) {
      setError('Failed to schedule video tour');
    }
    setLoading(false);
  }

  return (
    <div className="p-4 bg-white rounded shadow">
      <h4 className="font-semibold mb-2">Schedule a Live Video Tour</h4>
      <label htmlFor="video-tour-date" className="block mb-1">Select date and time:</label>
      <input
        id="video-tour-date"
        type="datetime-local"
        value={date}
        onChange={e => setDate(e.target.value)}
        className="border px-2 py-1 rounded mb-2"
        placeholder="Choose date and time"
        title="Choose date and time for the video tour"
      />
      <button onClick={handleSchedule} disabled={loading || scheduled} className="px-4 py-2 bg-blue-600 text-white rounded">
        {loading ? 'Scheduling...' : scheduled ? 'Scheduled!' : 'Schedule Video Tour'}
      </button>
      {error && <div className="text-sm text-red-500 mt-1">{error}</div>}
    </div>
  );
}
