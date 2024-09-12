import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
//import { Actions } from './src/Actions'; // Adjust path based on file location
//import { Actions } from './src/Actions';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  transports: ['websocket'], // Ensure WebSocket is used
});

const userMapSocket={};

function getAllClients(roomId){
  return Array.from(io.sockets.adapter.rooms.get(roomId)||[]).map((socketId)=>{
    return{
      socketId,
    userName:userMapSocket[socketId],
    }
  })
}
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  socket.on(Actions.JOIN,({roomId,userName})=>{
    userMapSocket[socket.id]=userName;
    socket.join(roomId);
    const clients=getAllClients(roomId);
    console.log('Clients in room', roomId, ':', clients);
  })


  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);

  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
