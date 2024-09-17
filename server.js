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
      clients.forEach(({ socketId }) => {
        io.to(socketId).emit(ACTION.JOINED, {
          clients,
          userName,
          socketId: socket.id,
        });
      });
    }
  });

  //syncing the code
  socket.on(ACTION.CODE_CHANGE,({roomId,code})=>{
   // console.log('Recieving',code);
    socket.in(roomId).emit(ACTION.CODE_CHANGE,{code})
  })

  socket.on(ACTION.SYNC_CODE,({socketId,code})=>{
    // console.log('Recieving',code);
     io.to(socketId).emit(ACTION.SYNC_CODE,{code})
   })

  socket.on('disconnecting', () => {
    console.log('Socket disconnected:', socket.id);

    // Find the rooms the socket was in
    const rooms = [...socket.rooms];

    rooms.forEach((roomId) => {
      // Notify other users in the room that the user has disconnected
      socket.to(roomId).emit(ACTION.USER_DISCONNECTED, {
        socketId: socket.id,
        userName: userMapSocket[socket.id],
      });
    });

    // Remove user from the user map
    delete userMapSocket[socket.id];
  });
});

// Define the PORT
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
