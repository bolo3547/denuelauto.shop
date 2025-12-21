import React from 'react';
import OpenChatWidget from '../components/OpenChatWidget';

export default function OpenChatPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className='text-2xl font-bold mb-4'>OpenChat Demo</h1>
      <OpenChatWidget />
    </div>
  );
}
