import express from 'express';
import { Server } from 'socket.io';
import http from 'http';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

/**
 * Maneja conexiones de Socket.io
 */
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);
  
  // Para señalización WebRTC
  socket.on('offer', (data) => {
    socket.broadcast.emit('offer', data);
  });
  
  socket.on('answer', (data) => {
    socket.broadcast.emit('answer', data);
  });
  
  socket.on('ice-candidate', (data) => {
    socket.broadcast.emit('ice-candidate', data);
  });
});

server.listen(3001, () => {
  console.log('Realtime service running on port 3001');
});