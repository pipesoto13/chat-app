const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

/* let count = 0;

io.on('connection', (socket) => {
  console.log('New WebSocket connection!');

  socket.emit('countUpdated', count);

  socket.on('increment', () => {
    count++;
    //socket.emit('countUpdated', count);
    io.emit('countUpdated', count);
  });
}); */

io.on('connection', (socket) => {
  console.log('New WebSocket connection!');

  socket.emit('message', {
    text: 'Welcome!',
    createdAt: new Date().getTime(),
  });
  socket.broadcast.emit('message', 'A new user has joined the room!');

  socket.on('sendMessage', (text, callback) => {
    io.emit('message', text);
    callback('Delivered!');
  });

  socket.on('sendLocation', (coords, callback) => {
    //socket.broadcast.emit('message', `Location : ${coords.lat}, ${coords.long}`);
    io.emit(
      'locationMessage',
      `https://google.com/maps?q=${coords.lat}, ${coords.long}`
    );
    callback('Location shared!');
  });

  socket.on('disconnect', () => {
    io.emit('message', 'User Disconnected');
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}!`);
});
