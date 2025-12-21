'use client';

import { useState } from 'react';

interface ChatMessage {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  message: string;
  timestamp: string;
  isFromCustomer: boolean;
  isRead: boolean;
}

interface ChatSession {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: 'active' | 'waiting' | 'closed';
  messages: ChatMessage[];
}

export default function AdminChatPage() {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([
    {
      id: '1',
      customerId: 'cust1',
      customerName: 'John Smith',
      customerEmail: 'john.smith@email.com',
      lastMessage: 'Hi, I\'m interested in the Toyota Harrier',
      lastMessageTime: '2025-11-26T10:30:00',
      unreadCount: 3,
      status: 'active',
      messages: [
        {
          id: '1',
          customerId: 'cust1',
          customerName: 'John Smith',
          customerEmail: 'john.smith@email.com',
          message: 'Hello, I saw your Toyota Harrier on the website',
          timestamp: '2025-11-26T10:25:00',
          isFromCustomer: true,
          isRead: true,
        },
        {
          id: '2',
          customerId: 'cust1',
          customerName: 'John Smith',
          customerEmail: 'john.smith@email.com',
          message: 'Hi John! Thank you for your interest. The Harrier is a great choice.',
          timestamp: '2025-11-26T10:26:00',
          isFromCustomer: false,
          isRead: true,
        },
        {
          id: '3',
          customerId: 'cust1',
          customerName: 'John Smith',
          customerEmail: 'john.smith@email.com',
          message: 'Can you tell me more about the financing options?',
          timestamp: '2025-11-26T10:28:00',
          isFromCustomer: true,
          isRead: false,
        },
        {
          id: '4',
          customerId: 'cust1',
          customerName: 'John Smith',
          customerEmail: 'john.smith@email.com',
          message: 'Hi, I\'m interested in the Toyota Harrier',
          timestamp: '2025-11-26T10:30:00',
          isFromCustomer: true,
          isRead: false,
        },
      ],
    },
    {
      id: '2',
      customerId: 'cust2',
      customerName: 'Sarah Johnson',
      customerEmail: 'sarah.j@email.com',
      lastMessage: 'Do you have any SUVs in stock?',
      lastMessageTime: '2025-11-26T09:15:00',
      unreadCount: 1,
      status: 'waiting',
      messages: [
        {
          id: '5',
          customerId: 'cust2',
          customerName: 'Sarah Johnson',
          customerEmail: 'sarah.j@email.com',
          message: 'Do you have any SUVs in stock?',
          timestamp: '2025-11-26T09:15:00',
          isFromCustomer: true,
          isRead: false,
        },
      ],
    },
  ]);

  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [chatSettings, setChatSettings] = useState({
    isEnabled: true,
    workingHours: {
      start: '09:00',
      end: '18:00',
    },
    autoReplyEnabled: true,
    autoReplyMessage: 'Thank you for your message. Our team will respond within 24 hours.',
    maxConcurrentChats: 5,
  });

  const handleSendMessage = () => {
    if (!selectedSession || !newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      customerId: selectedSession.customerId,
      customerName: 'Admin',
      customerEmail: 'admin@enuelmotors.com',
      message: newMessage,
      timestamp: new Date().toISOString(),
      isFromCustomer: false,
      isRead: true,
    };

    const updatedSession = {
      ...selectedSession,
      messages: [...selectedSession.messages, message],
      lastMessage: newMessage,
      lastMessageTime: new Date().toISOString(),
    };

    setChatSessions(sessions =>
      sessions.map(session =>
        session.id === selectedSession.id ? updatedSession : session
      )
    );

    setSelectedSession(updatedSession);
    setNewMessage('');
  };

  const markAsRead = (sessionId: string) => {
    setChatSessions(sessions =>
      sessions.map(session =>
        session.id === sessionId
          ? { ...session, unreadCount: 0, messages: session.messages.map(msg => ({ ...msg, isRead: true })) }
          : session
      )
    );
  };

  const closeChat = (sessionId: string) => {
    setChatSessions(sessions =>
      sessions.map(session =>
        session.id === sessionId ? { ...session, status: 'closed' as const } : session
      )
    );
    if (selectedSession?.id === sessionId) {
      setSelectedSession(null);
    }
  };

  const selectSession = (session: ChatSession) => {
    setSelectedSession(session);
    markAsRead(session.id);
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex">
      {/* Chat Sessions Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Customer Chat</h2>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-gray-600">
              {chatSessions.filter(s => s.status === 'active').length} active chats
            </span>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${chatSettings.isEnabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-xs text-gray-600">
                {chatSettings.isEnabled ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {chatSessions.map((session) => (
            <div
              key={session.id}
              onClick={() => selectSession(session)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                selectedSession?.id === session.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-gray-900">{session.customerName}</h3>
                    <span className={`px-2 py-1 text-xs rounded ${
                      session.status === 'active' ? 'bg-green-100 text-green-800' :
                      session.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {session.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 truncate">{session.lastMessage}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(session.lastMessageTime).toLocaleTimeString()}
                  </p>
                </div>
                {session.unreadCount > 0 && (
                  <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {session.unreadCount}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedSession ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-gray-900">{selectedSession.customerName}</h3>
                  <p className="text-sm text-gray-600">{selectedSession.customerEmail}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => closeChat(selectedSession.id)}
                    className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200"
                  >
                    Close Chat
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedSession.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isFromCustomer ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.isFromCustomer
                        ? 'bg-gray-100 text-gray-900'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    <p className="text-sm">{message.message}</p>
                    <p className={`text-xs mt-1 ${
                      message.isFromCustomer ? 'text-gray-500' : 'text-blue-100'
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="text-6xl text-gray-300 mb-4">💬</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a chat to start messaging</h3>
              <p className="text-gray-600">Choose a customer conversation from the sidebar</p>
            </div>
          </div>
        )}
      </div>

      {/* Settings Panel */}
      <div className="w-80 bg-white border-l border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Chat Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={chatSettings.isEnabled}
                onChange={(e) => setChatSettings({ ...chatSettings, isEnabled: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Enable live chat</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Working Hours</label>
            <div className="flex space-x-2">
              <input
                id="workingHours-start"
                title="Working hours start"
                type="time"
                value={chatSettings.workingHours.start}
                onChange={(e) => setChatSettings({
                  ...chatSettings,
                  workingHours: { ...chatSettings.workingHours, start: e.target.value }
                })}
                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
              />
              <span className="text-gray-500">to</span>
              <input
                id="workingHours-end"
                title="Working hours end"
                type="time"
                value={chatSettings.workingHours.end}
                onChange={(e) => setChatSettings({
                  ...chatSettings,
                  workingHours: { ...chatSettings.workingHours, end: e.target.value }
                })}
                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={chatSettings.autoReplyEnabled}
                onChange={(e) => setChatSettings({ ...chatSettings, autoReplyEnabled: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Auto-reply when offline</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Auto-reply Message</label>
            <textarea
              id="auto-reply-message"
              title="Auto-reply message"
              value={chatSettings.autoReplyMessage}
              onChange={(e) => setChatSettings({ ...chatSettings, autoReplyMessage: e.target.value })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Concurrent Chats</label>
            <input
              id="max-concurrent-chats"
              title="Max concurrent chats"
              type="number"
              value={chatSettings.maxConcurrentChats}
              onChange={(e) => setChatSettings({ ...chatSettings, maxConcurrentChats: parseInt(e.target.value) })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              min="1"
              max="20"
            />
          </div>
        </div>
      </div>
    </div>
  );
}