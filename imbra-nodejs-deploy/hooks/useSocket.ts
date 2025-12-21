// Socket.io hook for real-time chat
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  fromUserId: string;
  toUserId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

interface UseSocketReturn {
  socket: Socket | null;
  messages: Message[];
  sendMessage: (toUserId: string, content: string) => void;
  markAsRead: (messageIds: string[]) => void;
  isConnected: boolean;
  typingUsers: Record<string, boolean>;
  setTyping: (isTyping: boolean) => void;
}

export function useSocket(currentUserId: string, tenantId: string = 'tenant-1'): UseSocketReturn {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io(process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '', {
      path: '/api/socketio',
    });

    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('Connected to socket server');
      setIsConnected(true);
      socketInstance.emit('join-tenant', tenantId);
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from socket server');
      setIsConnected(false);
    });

    socketInstance.on('new-message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    socketInstance.on('messages-read', (messageIds: string[]) => {
      setMessages(prev => 
        prev.map(msg => 
          messageIds.includes(msg.id) ? { ...msg, read: true } : msg
        )
      );
    });

    socketInstance.on('user-typing', ({ userId, isTyping }: { userId: string; isTyping: boolean }) => {
      setTypingUsers(prev => ({ ...prev, [userId]: isTyping }));
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [currentUserId, tenantId]);

  const sendMessage = (toUserId: string, content: string) => {
    if (!socket || !content.trim()) return;

    socket.emit('send-message', {
      tenantId,
      fromUserId: currentUserId,
      toUserId,
      content: content.trim(),
      timestamp: new Date().toISOString(),
    });
  };

  const markAsRead = (messageIds: string[]) => {
    if (!socket || !messageIds.length) return;
    socket.emit('mark-read', { tenantId, messageIds });
  };

  const setTyping = (isTyping: boolean) => {
    if (!socket) return;
    socket.emit('typing', { tenantId, userId: currentUserId, isTyping });
  };

  return {
    socket,
    messages,
    sendMessage,
    markAsRead,
    isConnected,
    typingUsers,
    setTyping,
  };
}