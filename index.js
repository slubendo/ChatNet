const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const { generateResponse } = require("./openai");

// Mock database for storing chats and user information
let chats = [];
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

  socket.on("chat message", async (msg) => {
    console.log(`message: ${msg}`);

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

const PORT = process.env.PORT || 3000;

http.listen(PORT, () => {
  console.log(`listening on port:${PORT}`);
});
