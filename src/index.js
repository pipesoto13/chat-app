const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

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

  socket.emit('message', generateMessage('Welcome!'));
  socket.broadcast.emit('message', generateMessage('A new user has joined the room!'));

  socket.on('join', (options, callback) => {
    const { error, user } = addUser({ id: socket.id, ...options });

    if (error) {
      return callback(error);
    }

    // Join the room
    socket.join(user.room);
    // Welcome the user to the room
    socket.emit('message', generateMessage('Welcome!'));
    // Broadcast an event to everyone in the room
    socket.broadcast.to(user.room).emit(
      'message',
      generateMessage(`${user.username} has joined!`)
    );

    callback();
  });

  socket.on('sendMessage', (text, callback) => {
    io.emit('message', generateMessage(text));
    callback('Delivered!');
  });

  socket.on('sendLocation', (coords, callback) => {
    //socket.broadcast.emit('message', `Location : ${coords.lat}, ${coords.long}`);
    io.emit(
      'locationMessage',
      generateLocationMessage(`https://google.com/maps?q=${coords.lat}, ${coords.long}`),
    );
    callback('Location shared!');
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit('message', generateMessage(`${user.username} has left the room!`));
    }
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}!`);
});
