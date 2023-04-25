const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const { promptMessage } = require("./openai.js");
const { handleConnection } = require("./socket.js");

// Mock database for storing chats and user information
let chats = [
  { username: "user 1", message: "hi" },
  { username: "user 2", message: "this is a stored chat" },
];
let users = {};

app.use(express.static(__dirname + "/public"));
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

io.on("connection", (socket) => {
  console.log("a user connected");

  // Send all stored chats to the new user
  socket.emit("chats", chats);

  handleConnection(socket, io, chats, users, promptMessage);
});

const PORT = process.env.PORT || 3000;

http.listen(PORT, () => {
  console.log(`listening on port:${PORT}`);
});
