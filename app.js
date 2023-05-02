import express from "express";
// import expressLayouts from "express-ejs-layouts";
import session from "express-session";
import { url } from "inspector";
import path from "path";
import { passportMiddleware } from "../ChatGPTCollab/middleware/passportMiddleware.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { ensureAuthenticated } from "../ChatGPTCollab/middleware/checkAuth.js";
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

app.get("/", (req, res) => {
  res.render("landing");
});

// Define the global variable outside of the route handler function
let username;

app.get("/home", ensureAuthenticated, async (req, res) => {
  // Assign the value of req.user.username to the global variable
  let user = await req.user;
  username = user.username;
  let chats = await chatModel.getChats();
  console.log(chats);
  res.render("home", {
    username: username,
    chats: chats,
  });
});

app.use("/auth", authRoute);

app.get("/session", ensureAuthenticated, async (req, res) => {
  let user = await req.user;
  username = user.username;
  res.status(200).json({ session: username });
});

let chatRoomId;
app.get("/chatroom/:chatRoomId", async (req, res) => {
  chatRoomId = req.params.chatRoomId;
  const chat = await chatModel.getChatById(parseInt(chatRoomId));
  // console.log(chat);
  const chats = await chatModel.getChats();
  // console.log("Chats returns this: ", chats)
  const chatRoomName = chat.name;
  res.render("chatRoom", { chats, chatRoomName, chatRoomId });
});

io.on("connection", async (socket) => {
  let messages = await messageModel.getMessagesByChatId(Number(chatRoomId));
  let usernames = [];
  for (let msg of messages) {
    let username = (await userModel.getUserById(msg.senderId)).username;
    usernames.push(username);
  }
  // Send all stored chats to the new user
  socket.emit("chats", messages, usernames);

  handleConnection(
    socket,
    io,
    messages,
    usernames,
    promptMessage,
    username,
    chatRoomId
  );
  //promptMessage is from openai.js
});

http.listen(PORT, () => {
  console.log(`listening on:http://localhost:${PORT}/`);
});
