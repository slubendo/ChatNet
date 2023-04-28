import { promptMessage } from "./openai.js";

const actions = {
  "@ChatGPT -h": async (msg, socket, io, chats, username) => {
    try {
      io.emit("chat message", { username: username, message: msg });
      chats.push({ username: username, message: msg });

      const response = await promptMessage({
        message: JSON.stringify(chats),
        type: "chat",
      });

      io.emit("chat message", { username: "ChatGPT", message: response });

      chats.push({ username: "ChatGPT", message: response });
    } catch (error) {
      console.error(error);
    }
  },
  "@ChatGPT": async (msg, socket, io, chats, username) => {
    const prompt = msg.replace("@ChatGPT", "").trim();

    try {
      io.emit("chat message", { username: username, message: msg });
      chats.push({ username: username, message: msg });

      const response = await promptMessage({ message: prompt, type: "chat" });

      io.emit("chat message", { username: "ChatGPT", message: response });

      chats.push({ username: "ChatGPT", message: response });
    } catch (error) {
      console.error(error);
    }
  },
  "@help": async (msg, socket, io) => {
    io.emit("chat message", {
      username: "helper",
      message: "type @ChatGPT to prompt ChatGPT, @help for help",
    });
  },

  // Add more actions here as needed
};

export function handleConnection(
  socket,
  io,
  chats,
  users,
  promptMessage,
  username
) {
  socket.on("chat message", async (msg) => {
    console.log(`message: ${msg}`);

    for (const keyword in actions) {
      if (msg.includes(keyword)) {
        const action = actions[keyword];
        await action(msg, socket, io, chats, username);
        // chats.push({ username: socket.username, message: msg });
        return; // Exit the loop after the first match is found
      }
    }

    // Add the new chat to the mock database
    chats.push({ username: username, message: msg });
    io.emit("chat message", { username: username, message: msg }); // Send the message to all clients
    console.log(chats);
  });

  // socket.on("login", (data) => {
  //   console.log(`login: ${data.username}`);

  //   // Store the user information in the mock database
  //   socket.username = data.username;
  //   users[data.username] = { password: data.password };
  // });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
}

// module.exports = { handleConnection };
