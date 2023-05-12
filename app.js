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

app.get("/home", ensureAuthenticated, async (req, res) => {
  // Assign the value of req.user.username to the global variable
  let currentUser = await req.user;
  console.log(currentUser);
  let currentUsername = currentUser.username;
  let currentUserId = currentUser.id;
  let userChatrooms = await chatModel.getChatsByUserId(parseInt(currentUserId));

  res.render("home", {
    username: currentUsername,
    chats: userChatrooms,
  });
});

app.use("/auth", authRoute);

app.get("/chatroom/:chatRoomId", ensureAuthenticated, async (req, res) => {
  let chatRoomId;
  chatRoomId = req.params.chatRoomId;
  let currentUser = await req.user;
  let currentUserId = currentUser.id;

  let userChatrooms = await chatModel.getChatsByUserId(parseInt(currentUserId));

  const updatedChatrooms = [];

  for (const chatroom of userChatrooms) {
    const mostRecentMessage = await chatModel.getMostRecentMessage(chatroom.id);

    if (mostRecentMessage !== null) {
      const user = await userModel.getUserById(mostRecentMessage.senderId);
      const truncatedText = mostRecentMessage.text.substring(0, 10) + "...";

      const chatroomWithRecentMessage = {
        ...chatroom,
        mostRecentMessage: {
          ...mostRecentMessage,
          text: ": " + truncatedText,
          username: user.username,
        },
      };

      updatedChatrooms.push(chatroomWithRecentMessage);
    } else {
      const chatroomWithRecentMessage = {
        ...chatroom,
        mostRecentMessage: {
          ...mostRecentMessage,
          text: "",
          username: "",
        },
      };

      updatedChatrooms.push(chatroomWithRecentMessage);
    }
  }
  // console.log(updatedChatrooms);
  let membersInChat = await chatModel.getMembersOfChat(parseInt(chatRoomId));
  membersInChat = membersInChat.filter(
    (member) => member.memberName !== "ChatGPT"
  );

  let chatAdmin = await chatModel.getAdminOfChat(parseInt(chatRoomId));

  res.render("chatRoom", {
    chats: updatedChatrooms,
    chatRoomId: chatRoomId,
    membersInChat: membersInChat,
    numOfUsers: membersInChat.length,
    chatAdmin: chatAdmin,
    currentUserId: currentUserId,
  });
});

app.get("/currentUser", ensureAuthenticated, async (req, res) => {
  let currentUser = await req.user;
  res.status(200).json({ currentUser: currentUser });
});

io.on("connection", async (socket) => {
  const chatRoomId = socket.handshake.query.chatRoomId;
  const currentUser = await socket.handshake.query.currentUserData;
  console.log(chatRoomId);

  const parsedUser = JSON.parse(currentUser);

  console.log("userId: "+ parsedUser.id)

  if (chatRoomId !== undefined) {
    let allChatMsg = await messageModel.getMessagesByChatId(
      parseInt(chatRoomId)
    );
    socket.emit("chats", allChatMsg);

    const formattedAllChatMsg = allChatMsg.map((chatmsg) => {
      return { username: chatmsg.sender.username, content: chatmsg.text };
    });

    // const formattedAllChatMsgWithDate = allChatMsg.map((chatmsg) => {
    //   return { username: chatmsg.sender.username, content: chatmsg.text, date: chatmsg.createdAt };
    // });

    handleConnection(
      socket,
      io,
      promptMessage,
      parseInt(chatRoomId),
      currentUser,
      formattedAllChatMsg,
      allChatMsg
    );
  }
});

//@ create chat room
app.post("/create_chat", ensureAuthenticated, async (req, res) => {
  const { chatName } = req.body;

  let currentUser = await req.user;
  let currentUserId = currentUser.id;

  let isChatNameValid = chatName.trim() !== "";
  if (isChatNameValid) {
    await chatModel.createNewChat(chatName, currentUserId);
    res.redirect("/home");
  } else {
    console.log("Chat name cannot be empty.");
  }
});

//@ search user in database

app.post("/search-email", ensureAuthenticated, async (req, res) => {
  try {
    const { emailInputValue } = req.body;
    const resultedUser = await userModel.getUserByEmail(emailInputValue);

    if (resultedUser !== null) {
      res.json({ success: true, resultedUser: resultedUser });
    } else {
      res.json({ success: false });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while searching for the user." });
  }
});

app.post("/add-member", ensureAuthenticated, async (req, res) => {
  try {
    const { email, chatRoomId } = req.body;
    const resultedUser = await userModel.getUserByEmail(email);
    try {
      let updatedChat = await chatModel.addChatMember(
        parseInt(chatRoomId),
        resultedUser.id
      );

      if (updatedChat) {
        res.json({
          success: true,
          message: "Member added successfully.",
          chatRoomId: chatRoomId,
        });
      }
    } catch (error) {
      res.json({
        success: false,
        error: error.message,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

http.listen(PORT, () => {
  console.log(`listening on:http://localhost:${PORT}/`);
});
