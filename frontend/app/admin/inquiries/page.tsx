'use client';

import { useState } from 'react';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  carId?: string;
  carName?: string;
  status: 'New' | 'Read' | 'Replied' | 'Closed';
  createdAt: string;
}

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+260 971 234 567',
      subject: 'Inquiry about Toyota Harrier',
      message: 'Hi, I\'m interested in the Toyota Harrier listed on your website. Can you provide more details about the vehicle condition and pricing?',
      carId: '1',
      carName: '2017 Toyota Harrier',
      status: 'New',
      createdAt: '2024-01-15T10:30:00Z',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+260 955 123 456',
      subject: 'Financing Options',
      message: 'Hello, I would like to know about your financing options for purchasing a vehicle.',
      status: 'Read',
      createdAt: '2024-01-14T14:20:00Z',
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      phone: '+260 977 789 012',
      subject: 'Shipping to South Africa',
      message: 'Can you arrange shipping for a vehicle to Johannesburg, South Africa? What are the costs involved?',
      status: 'Replied',
      createdAt: '2024-01-13T09:15:00Z',
    },
  ]);

  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [replyMessage, setReplyMessage] = useState('');

  const handleStatusChange = (inquiryId: string, status: Inquiry['status']) => {
    setInquiries(inquiries.map(inq =>
      inq.id === inquiryId ? { ...inq, status } : inq
    ));
  };

  const handleReply = () => {
    if (selectedInquiry && replyMessage.trim()) {
      // In a real app, this would send an email
      alert(`Reply sent to ${selectedInquiry.name}`);
      setReplyMessage('');
      setSelectedInquiry(null);
      handleStatusChange(selectedInquiry.id, 'Replied');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customer Inquiries</h1>
        <p className="text-gray-600">Manage and respond to customer inquiries</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inquiries List */}
        <div className="bg-white shadow rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold">All Inquiries</h2>
          </div>
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {inquiries.map((inquiry) => (
              <div
                key={inquiry.id}
                className={`p-4 cursor-pointer hover:bg-gray-50 ${
                  selectedInquiry?.id === inquiry.id ? 'bg-blue-50' : ''
                }`}
                onClick={() => setSelectedInquiry(inquiry)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-medium text-gray-900">
                        {inquiry.name}
                      </h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        inquiry.status === 'New'
                          ? 'bg-red-100 text-red-800'
                          : inquiry.status === 'Read'
                          ? 'bg-yellow-100 text-yellow-800'
                          : inquiry.status === 'Replied'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {inquiry.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{inquiry.subject}</p>
                    {inquiry.carName && (
                      <p className="text-xs text-blue-600 mt-1">Regarding: {inquiry.carName}</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDate(inquiry.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inquiry Details */}
        <div className="bg-white shadow rounded-lg">
          {selectedInquiry ? (
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {selectedInquiry.name}
                  </h2>
                  <p className="text-sm text-gray-600">{selectedInquiry.email}</p>
                  <p className="text-sm text-gray-600">{selectedInquiry.phone}</p>
                </div>
                <select
                  value={selectedInquiry.status}
                  onChange={(e) => handleStatusChange(selectedInquiry.id, e.target.value as Inquiry['status'])}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                  title="Inquiry status"
                >
                  <option value="New">New</option>
                  <option value="Read">Read</option>
                  <option value="Replied">Replied</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div className="mb-4">
                <h3 className="font-medium text-gray-900">{selectedInquiry.subject}</h3>
                {selectedInquiry.carName && (
                  <p className="text-sm text-blue-600 mt-1">Vehicle: {selectedInquiry.carName}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  {formatDate(selectedInquiry.createdAt)}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-700">{selectedInquiry.message}</p>
              </div>

              <div className="space-y-4">
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your reply..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={4}
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleReply}
                    disabled={!replyMessage.trim()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    Send Reply
                  </button>
                  <button
                    onClick={() => setSelectedInquiry(null)}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              Select an inquiry to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}