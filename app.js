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

app.get("/home", ensureAuthenticated, (req, res) => {
  // Assign the value of req.user.username to the global variable
  username = req.user.username;

  res.render("home", {
    username: username,
  });
});

app.get("/session", (req, res) => {
  res.status(200).json({ session: req.user.username })
})

app.get("/chatroom", (req, res) => {
  res.render("chatRoom");
});

app.use("/auth", authRoute);

io.on("connection", (socket) => {
  console.log("chatroom connected");
});

// Mock database for storing chats and user information
let chats = [
  { username: "John", message: "what is the capital of Canada?" },
  {
    username: "Sara",
    message:
      "I don't know, ask ChatGPT by using @ChatGPT -h. The -h flag lets ChatGPT use the conversation history to help answer. ",
  },
];
let users = [];

io.on("connection", (socket) => {
  console.log("a user connected");

  // Send all stored chats to the new user
  socket.emit("chats", chats);

  console.log();

  handleConnection(socket, io, chats, users, promptMessage, username);
});

// app.use((req, res, next) => {
//   console.log(`req.user details are: `);
//   console.log(req.user);

//   console.log("req.session object:");
//   console.log(req.session);

//   console.log(`Session details are: `);
//   console.log(req.session.passport);
//   next();
// });

http.listen(PORT, () => {
  console.log(`listening on:http://localhost:${PORT}/`);
});
