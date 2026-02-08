import React, { useState, useEffect } from 'react';
import { FaPaperPlane, FaSmile, FaUserCircle, FaCircle } from 'react-icons/fa';
import { useSocket } from '../hooks/useSocket';

// Default users (used as fallback while API loads)
const defaultUsers = [
  { id: 'staff1', name: 'John Doe', role: 'Sales Manager', avatar: '' },
  { id: 'staff2', name: 'Jane Smith', role: 'Technician', avatar: '' },
  { id: 'staff3', name: 'Mary Lee', role: 'Finance', avatar: '' },
];

export default function BackOfficeChat({ currentUserId = 'staff1', tenantId = 'tenant-1' }) {
  const [users, setUsers] = useState(defaultUsers);
  const [selectedUser, setSelectedUser] = useState(defaultUsers[1]);
  const [input, setInput] = useState('');
  const { messages, sendMessage, isConnected, typingUsers, setTyping } = useSocket(currentUserId, tenantId);

  // Fetch staff users from API
  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch(`/api/tenants/${tenantId}/staff`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.staff) && data.staff.length > 0) {
            const staffList = data.staff
              .filter((s: any) => s.id !== currentUserId)
              .map((s: any) => ({
                id: s.id,
                name: s.name || s.email,
                role: s.role || 'Staff',
                avatar: s.avatar || '',
              }));
            if (staffList.length > 0) {
              setUsers(staffList);
              setSelectedUser(staffList[0]);
            }
          }
        }
      } catch {
        // Keep default users on failure
      }
    }
    fetchUsers();
  }, [tenantId, currentUserId]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(selectedUser.id, input);
    setInput('');
    setTyping(false);
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    setTyping(value.length > 0);
  };

  // Filter messages for current conversation
  const conversationMessages = messages.filter(
    msg => 
      (msg.fromUserId === currentUserId && msg.toUserId === selectedUser.id) ||
      (msg.fromUserId === selectedUser.id && msg.toUserId === currentUserId)
  );

  return (
    <div className="flex h-96 w-full max-w-2xl border rounded-lg shadow bg-white overflow-hidden">
      {/* Sidebar: User List */}
      <div className="w-1/3 bg-gray-50 border-r flex flex-col">
        <div className="p-3 font-bold text-gray-700 border-b">Staff</div>
        <ul className="flex-1 overflow-y-auto">
          {users.map(user => (
            <li key={user.id} className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 ${selectedUser.id === user.id ? 'bg-gray-200' : ''}`} onClick={() => setSelectedUser(user)}>
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
              ) : (
                <FaUserCircle className="w-8 h-8 text-gray-400" />
              )}
              <div>
                <div className="font-semibold text-sm">{user.name}</div>
                <div className="text-xs text-gray-500">{user.role}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        <div className="p-3 font-bold text-gray-700 border-b flex items-center justify-between">
          <span>Chat with {selectedUser.name}</span>
          <div className="flex items-center gap-2">
            <FaCircle className={`w-2 h-2 ${isConnected ? 'text-green-500' : 'text-red-500'}`} />
            <span className="text-xs text-gray-500">{isConnected ? 'Online' : 'Offline'}</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-white">
          {conversationMessages.map(m => (
            <div key={m.id} className={`flex ${m.fromUserId === currentUserId ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs px-4 py-2 rounded-lg shadow ${m.fromUserId === currentUserId ? 'bg-blue-100 text-blue-900' : 'bg-gray-100 text-gray-800'}`}>
                <div className="text-sm">{m.content}</div>
                <div className="text-xs text-right text-gray-400 mt-1">
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          {typingUsers[selectedUser.id] && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg text-sm italic">
                {selectedUser.name} is typing...
              </div>
            </div>
          )}
        </div>
        <div className="p-3 border-t flex items-center gap-2 bg-gray-50">
          <button className="text-xl text-gray-400 hover:text-blue-500"><FaSmile /></button>
          <input
            type="text"
            className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring"
            placeholder="Type a message..."
            value={input}
            onChange={e => handleInputChange(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            disabled={!isConnected}
          />
          <button 
            className={`text-xl ${isConnected ? 'text-blue-600 hover:text-blue-800' : 'text-gray-400'}`} 
            onClick={handleSend}
            disabled={!isConnected}
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  );
}
