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
  let currentUserId = currentUser.id;
  let userChatrooms = await chatModel.getChatsByUserId(parseInt(currentUserId));

  res.render("home", {
    username: currentUsername,
    chats: userChatrooms,
  });
});

app.use("/auth", authRoute);

app.get("/session", ensureAuthenticated, async (req, res) => {
  currentUser = await req.user;
  currentUsername = currentUser.username;
  res.status(200).json({ session: currentUsername });
});

let chatRoomId;
app.get("/chatroom/:chatRoomId", ensureAuthenticated, async (req, res) => {
  chatRoomId = req.params.chatRoomId;
  currentUser = await req.user;
  let currentUserId = currentUser.id;

  let userChatrooms = await chatModel.getChatsByUserId(parseInt(currentUserId));
  let membersInChat = await chatModel.getMembersOfChat(parseInt(chatRoomId));

  res.render("chatRoom", {
    chats: userChatrooms,
    chatRoomId: chatRoomId,
    numOfUsers: membersInChat.length - 1,
  });
});

io.on("connection", async (socket) => {
  if (chatRoomId !== undefined) {
    let allChatMsg = await messageModel.getMessagesByChatId(
      parseInt(chatRoomId)
    );
    socket.emit("chats", allChatMsg);

    const formattedAllChatMsg = allChatMsg.map((chatmsg) => {
      return { username: chatmsg.sender.username, content: chatmsg.text };
    });

    handleConnection(
      socket,
      io,
      promptMessage,
      parseInt(chatRoomId),
      currentUser,
      formattedAllChatMsg
    );
    //promptMessage is from openai.js
  }
});

//@ create chat room
app.post("/create_chat", async (req, res) => {
  const { chatName } = req.body;

  currentUser = await req.user;
  let currentUserId = currentUser.id;
  await chatModel.createNewChat(chatName, currentUserId);
  res.redirect("/home");
});

http.listen(PORT, () => {
  console.log(`listening on:http://localhost:${PORT}/`);
});
