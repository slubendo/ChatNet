import express from "express";
// import expressLayouts from "express-ejs-layouts";
import session from "express-session";
import { url } from "inspector";
import path from "path";
import { passportMiddleware } from "../ChatGPTCollab/middleware/passportMiddleware.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { generateResponse } from "./openai.js";
import { ensureAuthenticated } from "../ChatGPTCollab/middleware/checkAuth.js";

let chats = [];
let users = {};

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

app.get("/", ensureAuthenticated, (req, res) => {
  res.render("home", {
    username: req.user.username,
  });
});

app.get("/chatroom", (req, res) => {
  res.render("chatRoom");
});

app.use("/auth", authRoute);

io.on("connection", (socket) => {
  console.log("chatroom connected");

  // Send all stored chats to the new user
  socket.emit("chats", chats);

  socket.on("chat message", async (msg) => {
    if (msg.includes("@bot")) {
      const prompt = msg.replace("@bot", "").trim();

      try {
        const response = await generateResponse(prompt);
        io.emit(
          "chat message",
          `@bot ${JSON.stringify(response.data.choices[0].text)}`
        );
      } catch (error) {
        console.error(error);
      }
    } else {
      // Add the new chat to the mock database
      chats.push({ username: socket.username, message: msg });
      io.emit("chat message", { username: socket.username, message: msg });
    }
  });

  socket.on("login", (data) => {
    console.log(`login: ${data.username}`);

    // Store the user information in the mock database
    socket.username = data.username;
    users[data.username] = { password: data.password };
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
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
