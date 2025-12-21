"use client";

import React, { useState } from 'react';
import { getBuyerPortalData } from '../utils/buyerPortalService';

export default function BuyerPortal() {
  const data = getBuyerPortalData();
  const [chatInput, setChatInput] = useState('');
  const [chat, setChat] = useState(data.chat);

  function handleSendChat() {
    if (chatInput.trim()) {
      setChat([...chat, { from: 'You', message: chatInput }]);
      setChatInput('');
    }
  }

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      alert(`Uploaded: ${e.target.files[0].name}`);
    }
  }

  return (
    <div className="p-4 bg-white rounded shadow mt-6">
      <h3 className="font-semibold mb-2">Buyer Self-Service Portal</h3>
      <div className="mb-4">
        <h4 className="font-semibold">Orders</h4>
        <ul className="list-disc ml-6">
          {data.orders.map(order => (
            <li key={order.id}>{order.car} - <span className="font-bold">{order.status}</span> (${order.amount})</li>
          ))}
        </ul>
      </div>
      <div className="mb-4">
        <h4 className="font-semibold">Documents</h4>
        <ul className="list-disc ml-6">
          {data.documents.map(doc => (
            <li key={doc.name}>{doc.name} - <span className="font-bold">{doc.status}</span></li>
          ))}
        </ul>
        <label htmlFor="document-upload" className="block mb-1">Upload Document:</label>
        <input
          id="document-upload"
          type="file"
          onChange={handleUpload}
          className="mt-2"
          title="Upload document"
        />
      </div>
      <div className="mb-4">
        <h4 className="font-semibold">Payments</h4>
        <ul className="list-disc ml-6">
          {data.payments.map(pay => (
            <li key={pay.orderId}>Order {pay.orderId}: <span className="font-bold">{pay.status}</span> (${pay.amount})</li>
          ))}
        </ul>
      </div>
      <div className="mb-4">
        <h4 className="font-semibold">Chat</h4>
        <div className="bg-gray-100 p-2 rounded mb-2" style={{ maxHeight: 120, overflowY: 'auto' }}>
          {chat.map((msg, idx) => (
            <div key={idx}><span className="font-bold">{msg.from}:</span> {msg.message}</div>
          ))}
        </div>
        <input
          type="text"
          value={chatInput}
          onChange={e => setChatInput(e.target.value)}
          className="border px-2 py-1 rounded mr-2"
          placeholder="Type a message..."
        />
        <button onClick={handleSendChat} className="px-4 py-2 bg-blue-600 text-white rounded">Send</button>
      </div>
    </div>
  );
}
