// @ts-nocheck
// Socket.io server for real-time chat
// This would typically be in a separate Node.js server or integrated with Next.js API
import { Server } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';

type SocketServer = HTTPServer & {
  io?: Server;
};

type NextApiResponseServerIO = NextApiResponse & {
  socket: NextApiResponse['socket'] & {
    server: SocketServer;
  };
};

export default function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (!res.socket.server.io) {
    console.log('Starting Socket.io server...');
    
    const io = new Server(res.socket.server, {
      path: '/api/socketio',
      addTrailingSlash: false,
    });

    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      // Join user to their tenant room for isolated chat
      socket.on('join-tenant', (tenantId: string) => {
        socket.join(`tenant-${tenantId}`);
        console.log(`User ${socket.id} joined tenant-${tenantId}`);
      });

      // Handle sending messages
      socket.on('send-message', async (data) => {
        const { tenantId, fromUserId, toUserId, content, timestamp } = data;
        
        try {
          // Save to database (import prisma at top of file)
          const { prisma } = await import('../../lib/prisma');
          const savedMessage = await prisma.messages.create({
            data: {
              fromUserId,
              toUserId,
              content,
            },
          });
          
          const message = {
            id: savedMessage.id,
            fromUserId: savedMessage.fromUserId,
            toUserId: savedMessage.toUserId,
            content: savedMessage.content,
            timestamp: savedMessage.createdAt.toISOString(),
            read: savedMessage.read,
          };

          // Broadcast to tenant room
          io.to(`tenant-${tenantId}`).emit('new-message', message);
          
          console.log('Message saved and sent:', message.id);
        } catch (error) {
          console.error('Error saving message:', error);
        }
      });

      // Handle marking messages as read
      socket.on('mark-read', (data) => {
        const { tenantId, messageIds } = data;
        io.to(`tenant-${tenantId}`).emit('messages-read', messageIds);
      });

      // Handle user typing indicators
      socket.on('typing', (data) => {
        const { tenantId, userId, isTyping } = data;
        socket.to(`tenant-${tenantId}`).emit('user-typing', { userId, isTyping });
      });

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });

    res.socket.server.io = io;
  }

  res.end();
}
