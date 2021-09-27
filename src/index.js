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

  //socket.emit('message', generateMessage('Welcome!'));
  //socket.broadcast.emit('message', generateMessage('A new user has joined the room!'));

  socket.on('join', (options, callback) => {
    const { error, user } = addUser({ id: socket.id, ...options });

    if (error) {
      return callback(error);
    }

    // Join the room
    socket.join(user.room);
    // Welcome the user to the room
    socket.emit('message', generateMessage('Admin', 'Welcome!'));
    // Broadcast an event to everyone in the room
    socket.broadcast.to(user.room).emit(
      'message',
      generateMessage('Admin', `${user.username} has joined!`)
    );
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    });

    callback();
  });

  socket.on('sendMessage', (text, callback) => {
    const user  = getUser(socket.id);

    io.to(user.room).emit('message', generateMessage(user.username, text));
    callback('Delivered!');
  });

  socket.on('sendLocation', (coords, callback) => {
    const user = getUser(socket.id);
    console.log(user);
    //socket.broadcast.emit('message', `Location : ${coords.lat}, ${coords.long}`);
    io.to(user.room).emit(
      'locationMessage',
      generateLocationMessage(user.username, `https://google.com/maps?q=${coords.lat}, ${coords.long}`),
    );
    callback('Location shared!');
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left the room!`));
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      });
    }
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}!`);
});
