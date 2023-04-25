const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const { promptMessage } = require("./openai.js");

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

  const actions = {
    "@bot": async (msg) => {
      const prompt = msg.replace("@bot", "").trim();
  
      try {
        io.emit("chat message", { username: socket.username, message: msg });

        const response = await promptMessage({ message: prompt, type: "chat" });
        
        io.emit("chat message", { username: "ChatGPT", message: response });
      } catch (error) {
        console.error(error);
      }
    },
    "@help": async (msg) => {
      io.emit("chat message", { username: "helper", message: "type @bot to prompt the bot" });
    }

    // Add more actions here as needed
  };
  
  socket.on("chat message", async (msg) => {
    console.log(`message: ${msg}`);
  
    for (const keyword in actions) {
      if (msg.includes(keyword)) {
        const action = actions[keyword];
        await action(msg);
        return; // Exit the loop after the first match is found
      }
    }
  
    // Add the new chat to the mock database
    chats.push({ username: socket.username, message: msg });
    io.emit("chat message", { username: socket.username, message: msg }); // Send the message to all clients
    console.log(chats);
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

// if (msg.includes("@test")) {
//   const prompt = msg.replace("@test", "").trim();

//   try {
//     const response = "test received" + prompt;
//     io.emit("chat message", { username: socket.username, message: prompt });
//   } catch (error) {
//     console.error(error);
//   }
// }


// todo pass last x messages to prompt for context