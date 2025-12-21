'use client';

import React, { useState, useEffect } from 'react';
import { 
  FaComments, 
  FaPaperPlane, 
  FaWhatsapp, 
  FaPhone,
  FaVideo,
  FaUser,
  FaCheck,
  FaCheckDouble,
  FaTimes,
  FaSearch
} from 'react-icons/fa';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'car_link';
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  attachments?: {
    type: string;
    url: string;
    name: string;
  }[];
}

interface Conversation {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: 'active' | 'closed' | 'pending';
  assignedAgent?: string;
  source: 'website' | 'whatsapp' | 'phone' | 'email';
}

export default function CommunicationHub() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages();
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    try {
      // Mock data - replace with actual API
      const mockConversations: Conversation[] = [
        {
          id: '1',
          customerName: 'John Mukasa',
          customerEmail: 'john@example.com',
          customerPhone: '+256701234567',
          lastMessage: 'Is the Toyota Camry still available?',
          lastMessageTime: '2 minutes ago',
          unreadCount: 2,
          status: 'active',
          assignedAgent: 'Sarah Agent',
          source: 'website'
        },
        {
          id: '2',
          customerName: 'Mary Nakato',
          customerEmail: 'mary@example.com',
          customerPhone: '+256702345678',
          lastMessage: 'Thank you for the information about the Honda',
          lastMessageTime: '1 hour ago',
          unreadCount: 0,
          status: 'active',
          assignedAgent: 'David Sales',
          source: 'whatsapp'
        },
        {
          id: '3',
          customerName: 'Peter Ssemwanga',
          customerEmail: 'peter@example.com',
          customerPhone: '',
          lastMessage: 'Can we schedule a test drive?',
          lastMessageTime: '3 hours ago',
          unreadCount: 1,
          status: 'pending',
          source: 'phone'
        }
      ];

      setConversations(mockConversations);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      // Mock messages data
      const mockMessages: Message[] = [
        {
          id: '1',
          senderId: 'customer',
          senderName: 'John Mukasa',
          content: 'Hi, I\'m interested in the Toyota Camry listed on your website.',
          type: 'text',
          timestamp: '10:30 AM',
          status: 'read'
        },
        {
          id: '2',
          senderId: 'agent',
          senderName: 'Sarah Agent',
          content: 'Hello John! Thank you for your interest. The Toyota Camry is indeed available. Would you like more details about it?',
          type: 'text',
          timestamp: '10:32 AM',
          status: 'read'
        },
        {
          id: '3',
          senderId: 'customer',
          senderName: 'John Mukasa',
          content: 'Yes please. What\'s the mileage and service history?',
          type: 'text',
          timestamp: '10:35 AM',
          status: 'read'
        },
        {
          id: '4',
          senderId: 'customer',
          senderName: 'John Mukasa',
          content: 'Is it still available for viewing today?',
          type: 'text',
          timestamp: '2 minutes ago',
          status: 'delivered'
        }
      ];

      setMessages(mockMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: `${Date.now()}`,
      senderId: 'agent',
      senderName: 'Current Agent',
      content: newMessage,
      type: 'text',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Mark as delivered after 1 second
    setTimeout(() => {
      setMessages(prev => 
        prev.map(m => 
          m.id === message.id ? { ...m, status: 'delivered' } : m
        )
      );
    }, 1000);
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'whatsapp':
        return <FaWhatsapp className="w-4 h-4 text-green-500" />;
      case 'phone':
        return <FaPhone className="w-4 h-4 text-blue-500" />;
      case 'email':
        return <FaUser className="w-4 h-4 text-purple-500" />;
      default:
        return <FaComments className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <FaCheck className="w-3 h-3 text-gray-400" />;
      case 'delivered':
        return <FaCheckDouble className="w-3 h-3 text-gray-400" />;
      case 'read':
        return <FaCheckDouble className="w-3 h-3 text-blue-500" />;
      default:
        return null;
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || conv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Conversations Sidebar */}
      <div className="w-1/3 bg-white border-r border-gray-200">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
            <div className="flex gap-2">
              <button className="p-2 text-gray-500 hover:text-green-600" title="WhatsApp">
                <FaWhatsapp className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-500 hover:text-blue-600" title="Phone">
                <FaPhone className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <label htmlFor="statusFilter" className="sr-only">Filter conversations by status</label>
          <select
            id="statusFilter"
            aria-label="Filter conversations by status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Conversations</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {/* Conversations List */}
        <div className="overflow-y-auto h-full">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedConversation(conversation)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setSelectedConversation(conversation);
                }
              }}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedConversation?.id === conversation.id ? 'bg-blue-50 border-r-4 border-r-blue-500' : ''
              }`}
              aria-pressed={selectedConversation?.id === conversation.id}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">
                      {conversation.customerName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900 text-sm">{conversation.customerName}</h4>
                      {getSourceIcon(conversation.source)}
                    </div>
                    <p className="text-xs text-gray-500">{conversation.customerEmail}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-xs text-gray-500">{conversation.lastMessageTime}</div>
                  {conversation.unreadCount > 0 && (
                    <div className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mt-1">
                      {conversation.unreadCount}
                    </div>
                  )}
                </div>
              </div>

              <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
              
              <div className="flex items-center justify-between mt-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  conversation.status === 'active' 
                    ? 'bg-green-100 text-green-800'
                    : conversation.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {conversation.status}
                </span>
                
                {conversation.assignedAgent && (
                  <span className="text-xs text-blue-600">{conversation.assignedAgent}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">
                      {selectedConversation.customerName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{selectedConversation.customerName}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>{selectedConversation.customerEmail}</span>
                      {selectedConversation.customerPhone && (
                        <span>• {selectedConversation.customerPhone}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button type="button" title="Call customer" className="p-2 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-blue-50">
                    <FaPhone className="w-5 h-5" />
                  </button>
                  <button type="button" title="Start video call" className="p-2 text-gray-500 hover:text-green-600 rounded-lg hover:bg-green-50">
                    <FaVideo className="w-5 h-5" />
                  </button>
                  <button type="button" title="Close conversation" className="p-2 text-gray-500 hover:text-red-600 rounded-lg hover:bg-red-50">
                    <FaTimes className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === 'agent' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.senderId === 'agent'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    <p>{message.content}</p>
                    <div className={`flex items-center justify-between mt-1 text-xs ${
                      message.senderId === 'agent' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      <span>{message.timestamp}</span>
                      {message.senderId === 'agent' && (
                        <div className="ml-2">
                          {getStatusIcon(message.status)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  title="Send message"
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <FaPaperPlane className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* No Conversation Selected */
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <FaComments className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-500">Choose a conversation from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}