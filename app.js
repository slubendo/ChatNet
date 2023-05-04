import express from "express";
// import expressLayouts from "express-ejs-layouts";
import session from "express-session";
import { url } from "inspector";
import path from "path";
import { passportMiddleware } from "./middleware/passportMiddleware.js";
import { createServer } from "http";
import { Server } from "socket.io";
import {
  ensureAuthenticated,
  forwardAuthenticated,
} from "./middleware/checkAuth.js";
import { handleConnection } from "./socket.js";
import { promptMessage } from "./openai.js";
import { chatModel, userModel, messageModel } from "./prismaclient.js";

const app = express();
const http = createServer(app);
const io = new Server(http);

const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");

app.use(express.static("public"));

app.use(function (req, res, next) {
  next();
});

app.use(express.json());
// app.use(expressLayouts);
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
      maxAge: 24 * 60 * 60 * 1000, //24 hours
    },
  })
);

// import routes
import authRoute from "./route/authRoute.js";

passportMiddleware(app);

app.get("/", forwardAuthenticated, (req, res) => {
  res.render("landing");
});

// Define the global variable outside of the route handler function
let currentUsername;
let currentUser;

app.get("/home", ensureAuthenticated, async (req, res) => {
  // Assign the value of req.user.username to the global variable
  currentUser = await req.user;
  currentUsername = currentUser.username;
  let chats = await chatModel.getChats();
  console.log(chats);
  res.render("home", {
    username: currentUsername,
    chats: chats,
  });
});

app.use("/auth", authRoute);

app.get("/session", ensureAuthenticated, async (req, res) => {
  currentUser = await req.user;
  currentUsername = currentUser.username;
  res.status(200).json({ session: currentUsername })
});

let chatRoomId;
app.get("/chatroom/:chatRoomId", ensureAuthenticated, async (req, res) => {
  chatRoomId = req.params.chatRoomId;
  const chat = await chatModel.getChatById(parseInt(chatRoomId));
  const chats = await chatModel.getChats();
  const numberOfUsersInChat = await chatModel.getNumberOfUsersInChat(parseInt(chatRoomId));

  // console.log(numberOfUsersInChat)

  const chatRoomName = chat.name;
  res.render("chatRoom", { chats, chatRoomName, chatRoomId, numberOfUsersInChat });
});

io.on("connection", async (socket) => {
  let messages = await messageModel.getMessagesByChatId(Number(chatRoomId));
  socket.emit("chats", messages);

  handleConnection(socket, io, promptMessage, Number(chatRoomId), currentUser);
  //promptMessage is from openai.js
});

http.listen(PORT, () => {
  console.log(`listening on:http://localhost:${PORT}/`);
});
