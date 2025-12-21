import React, { useState } from 'react';
import { generateDocument } from '../utils/documentGenerator';

type DocumentType = 'proforma' | 'invoice' | 'contract';
const docTypes: { value: DocumentType; label: string }[] = [
  { value: 'proforma', label: 'Proforma Invoice' },
  { value: 'invoice', label: 'Invoice' },
  { value: 'contract', label: 'Sales Contract' },
];

export default function DocumentGenerator() {
  const [type, setType] = useState<DocumentType>(docTypes[0].value);
  const [buyer, setBuyer] = useState('');
  const [car, setCar] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [terms, setTerms] = useState('');
  const [docContent, setDocContent] = useState('');

  function handleGenerate() {
    const details = { buyer, car, amount, date, terms };
    setDocContent(generateDocument({ type, details }));
  }

  function handleDownload() {
    const blob = new Blob([docContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-4 bg-white rounded shadow mt-6">
      <h3 className="font-semibold mb-2">Automated Document Generator</h3>
      <div className="mb-2">
        <label htmlFor="docType">Document Type:</label>
        <select id="docType" value={type} onChange={e => setType(e.target.value as DocumentType)} className="ml-2 border px-2 py-1 rounded">
          {docTypes.map(dt => <option key={dt.value} value={dt.value}>{dt.label}</option>)}
        </select>
      </div>
      <div className="mb-2">
        <label htmlFor="buyer">Buyer:</label>
        <input id="buyer" value={buyer} onChange={e => setBuyer(e.target.value)} className="ml-2 border px-2 py-1 rounded" placeholder="Enter buyer name" />
      </div>
      <div className="mb-2">
        <label htmlFor="car">Car:</label>
        <input id="car" value={car} onChange={e => setCar(e.target.value)} className="ml-2 border px-2 py-1 rounded" placeholder="Enter car details" />
      </div>
      <div className="mb-2">
        <label htmlFor="amount">Amount:</label>
        <input id="amount" value={amount} onChange={e => setAmount(e.target.value)} className="ml-2 border px-2 py-1 rounded" placeholder="Enter amount" />
      </div>
      <div className="mb-2">
        <label htmlFor="date">Date:</label>
        <input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} className="ml-2 border px-2 py-1 rounded" />
      </div>
      {type === 'contract' && (
        <div className="mb-2">
          <label htmlFor="terms">Terms:</label>
          <textarea id="terms" value={terms} onChange={e => setTerms(e.target.value)} className="ml-2 border px-2 py-1 rounded" placeholder="Enter contract terms" />
        </div>
      )}
      <button onClick={handleGenerate} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded">Generate Document</button>
      {docContent && (
        <div className="mt-4">
          <pre className="bg-gray-100 p-2 rounded text-sm">{docContent}</pre>
          <button onClick={handleDownload} className="mt-2 px-4 py-2 bg-green-600 text-white rounded">Download</button>
        </div>
      )}
    </div>
  );
}
