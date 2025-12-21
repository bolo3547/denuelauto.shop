import React, { useState } from 'react';

interface CarReservationProps {
  carName: string;
}

const CarReservation: React.FC<CarReservationProps> = ({ carName }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [date, setDate] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="p-4 border rounded shadow bg-white">
      <h3 className="font-bold mb-2">Reserve Test Drive: {carName}</h3>
      {submitted ? (
        <div className="text-green-600 font-semibold">Reservation submitted! We'll contact you soon.</div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="border px-2 py-1 rounded"
            required
          />
          <input
            type="email"
            placeholder="Your Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="border px-2 py-1 rounded"
            required
          />
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="border px-2 py-1 rounded"
            required
          />
          <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded">Reserve</button>
        </form>
      )}
    </div>
  );
};

export default CarReservation;
