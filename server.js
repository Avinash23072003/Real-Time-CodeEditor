import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { ACTION } from './src/Constants/ACTION.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  transports: ['websocket'], // Ensure WebSocket is used
});

const userMapSocket={};

// const ACTION = {
//   JOIN: "join",
//   JOINED: "joined",
//   DISCONNECT: "disconnect",
//   CODE_CHANGE: "code-change",
//   SYNC_CODE: "sync-code",
//   LEAVE: "leave",
// };

function getAllClients(roomId){
  return Array.from(io.sockets.adapter.rooms.get(roomId)||[]).map((socketId)=>{
    return{
      socketId,
    userName:userMapSocket[socketId],
    }
  })
}

// actions.js



io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  socket.on(ACTION.JOIN,({roomId,userName})=>{
    if (!userMapSocket[socket.id]){
    userMapSocket[socket.id]=userName;
    socket.join(roomId);
    const clients=getAllClients(roomId);
    console.log('Clients in room', roomId, ':', clients);
    clients.forEach((socketId)=>{
    io.to(socketId).emit(ACTION.JOINED),{
      clients,
      userName,
      socketId:socket.id
    }
    })
  }})



  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);

  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
