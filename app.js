import express from "express";
import session from "express-session";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import { passportMiddleware } from "../ChatGPTCollab/middleware/passportMiddleware.js";
import { ensureAuthenticated } from "../ChatGPTCollab/middleware/checkAuth.js";
import { handleConnection } from "./socket.js";
import { promptMessage } from "./openai.js";
import http from "http";

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer);

const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");

app.use(express.static("public"));

app.use(function (req, res, next) {
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// session setup
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// import routes
import authRoute from "./route/authRoute.js";

passportMiddleware(app);

app.get("/", (req, res) => {
  res.render("landing");
});

// Define the global variable outside of the route handler function
let username;

app.get("/home", ensureAuthenticated, async (req, res) => {
  // Assign the value of req.user.username to the global variable
  let user = await req.user;
  username = user.username;

  res.render("home", {
    username: username,
  });
});

app.get("/session", (req, res) => {
  res.status(200).json({ session: req.user?.username });
});

app.get("/chatroom", (req, res) => {
  res.render("chatRoom");
});

app.use("/auth", authRoute);

// Mock database for storing chats and user information
let chatRooms = {
  room1: {
    name: "Room1",
    users: [],
    chats: [],
  },
  room111: {
    name: "Room111",
    users: ["user1", "user2", "user3"],
    chats: [{ username: "user1", message: "Hello" }],
  },
};

app.get("/chatroom", (req, res) => {
  const roomName = req.params.roomName;
  const chatRoom = chatRooms[roomName];

  res.render("chatRoom", { chatRooms, roomName, chatRoom });
});

app.get("/chatroom/:roomName", (req, res) => {
  const roomName = req.params.roomName;
  const chatRoom = chatRooms[roomName];

  res.render("chatRoom", { chatRooms, roomName, chatRoom });
});

// io.on("connection", (socket) => {
//   console.log("a user connected");

//   // Send all stored chats to the new user
//   socket.emit("chats", chats);

//   console.log();

//   handleConnection(socket, io, chats, users, promptMessage, username);
// });


io.on("connection", (socket) => {
  console.log("a user connected");

  // console.log(chatRooms)


  socket.on("join room", (roomName) => {
    socket.join(roomName);

    // Create a new chat room if it doesn't exist
    if (!chatRooms[roomName]) {
      chatRooms[roomName] = [];
      console.log(chatRooms);
    }

    // Send all stored chats to the new user
    socket.emit("chats", chatRooms[roomName]);
    // handleConnection(socket, io, chats, users, promptMessage, username);
  });

  socket.on("leave room", (roomName) => {
    socket.leave(roomName);
  });

// Joining and leaving rooms
socket.on("join room", (roomName) => {
  socket.join(roomName);
});

socket.on("leave room", (roomName) => {
  socket.leave(roomName);
});

// Broadcasting messages to a room
socket.on("send message to room", (data) => {
  socket.to(data.room).emit("new message", data.message);
});

// Broadcasting messages to all sockets except the sender
socket.on("send message to all except sender", (data) => {
  socket.broadcast.emit("new message", data.message);
});

// Handling disconnection
socket.on("disconnect", () => {
  console.log(`Socket ${socket.id} disconnected.`);
});

// Handling errors
socket.on("error", (err) => {
  console.log(`Socket ${socket.id} had an error: ${err}`);
});
});


httpServer.listen(PORT, () => {
  console.log(`listening on:http://localhost:${PORT}/`);
});
