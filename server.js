import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { ACTION } from './src/Constants/ACTION.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  transports: ['websocket'], // Ensure WebSocket is used
});

const userMapSocket = {};

// Function to get all clients in a room
function getAllClients(roomId) {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => {
    return {
      socketId,
      userName: userMapSocket[socketId],
    };
  });
}

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on(ACTION.JOIN, ({ roomId, userName }) => {
    if (!userMapSocket[socket.id]) {
      userMapSocket[socket.id] = userName;
      socket.join(roomId);
      const clients = getAllClients(roomId);
      console.log('Clients in room', roomId, ':', clients);

      // Emit to all clients in the room
      io.to(roomId).emit(ACTION.JOINED, {
        clients,
        userName,
        socketId: socket.id,
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);

    // Find the room the socket was in
    const rooms = Array.from(socket.rooms);
    rooms.forEach((roomId) => {
      if (roomId !== socket.id) {
        // Remove user from the user map
        delete userMapSocket[socket.id];

        // Get updated list of clients
        const clients = getAllClients(roomId);
        console.log('Updated clients in room', roomId, ':', clients);

        // Notify all clients in the room about the disconnection
        io.to(roomId).emit(ACTION.JOINED, {
          clients,
          userName: null, // No specific userName to emit here
          socketId: socket.id,
        });
      }
    });
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
