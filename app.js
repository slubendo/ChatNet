import express from "express";
import session from "express-session";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import { passportMiddleware } from "../ChatGPTCollab/middleware/passportMiddleware.js";
import { ensureAuthenticated } from "../ChatGPTCollab/middleware/checkAuth.js";
import { handleConnection } from "./socket.js";
import { promptMessage } from "./openai.js";

const app = express();
const http = createServer(app);
const io = new Server(http);

const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");

app.use(express.static("public"));

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
    chats: [],
  },
};

app.get("/chatroom/:roomName", (req, res) => {
  const roomName = req.params.roomName;
  const chatRoom = chatRooms[roomName];

  res.render("chatRoom", { chatRooms, roomName, chatRoom });
});

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("join room", (roomName) => {
    socket.join(roomName);

    // Create a new chat room if it doesn't exist
    if (!chatRooms[roomName]) {
      chatRooms[roomName] = [];
      console.log(chatRooms);
    }

    // Send all stored chats to the new user
    socket.emit("chats", chatRooms[roomName]);
  });

  socket.on("leave room", (roomName) => {
    socket.leave(roomName);
  });

  socket.on("chat message", async (msg, roomName) => {
    console.log(`message: ${msg}`);

    for (const keyword in actions) {
      const lowercaseKeyword = keyword.toLowerCase();
      if (msg.toLowerCase().includes(lowercaseKeyword)) {
        const action = actions[keyword];
        await action(msg, socket, io, chatRooms[roomName], username);
        return;
      }
    }

    // Add the new chat to the chat room
    chatRooms[roomName].push({ username: username, message: msg });
    io.to(roomName).emit("chat message", { username: username, message: msg });
    console.log(chatRooms[roomName]);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

http.listen(PORT, () => {
  console.log(`listening on:http://localhost:${PORT}/`);
});
