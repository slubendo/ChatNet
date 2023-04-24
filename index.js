const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Mock database for storing chats and user information
let chats = [];
let users = {};

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', (socket) => {
  console.log('a user connected');

  // Send all stored chats to the new user
  socket.emit('chats', chats);

  socket.on('chat message', (data) => {
    console.log('message: ' + data.msg);
    // Add the new chat to the mock database
    chats.push({ username: socket.username, msg: data.msg });
    io.emit('chat message', { username: socket.username, msg: data.msg });
  });

  socket.on('login', (data) => {
    console.log('login: ' + data.username);
    // Store the user information in the mock database
    socket.username = data.username;
    users[data.username] = { password: data.password };
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
