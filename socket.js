import { promptMessage } from "./openai.js";

export function handleConnection(
  socket,
  io,
  chatRooms,
  users,
  promptMessage,
  username
) {
  let currentRoom;

  socket.on("join room", (room) => {
    if (currentRoom) {
      // Leave the current room
      socket.leave(currentRoom);
    }
    // Join the new room
    socket.join(room);
    currentRoom = room;

    // Send all stored chats for the new room to the user
    socket.emit("chats", chatRooms[currentRoom]);

    console.log(`${username} joined ${currentRoom}`);
  });

  socket.on("leave room", (roomName) => {
    socket.leave(roomName);
  });

  socket.on("chat message", async (msg, roomName) => {
    console.log(`message: ${msg}`);

    const actions = {
      "@chatgpt -h": async (msg, socket, io, chats, username) => {
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
      "@chatgpt": async (msg, socket, io, chats, username) => {
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
          message: "type @ChatGPT to prompt ChatGPT, @Help for help",
        });
      },
    
      // Add more actions here as needed
    };
    

    for (const keyword in actions) {
      const lowercaseKeyword = keyword.toLowerCase();
      if (msg.toLowerCase().includes(lowercaseKeyword)) {
        const action = actions[keyword];
        await action(msg, socket, io, chatRooms[roomName], username);
        return;
      }
    }

    // Add the new chat to the chat room
    // chatRooms[roomName].push({ username: username, message: msg });
    if (!chatRooms[roomName]) {
      chatRooms[roomName] = { name: roomName, users: [], chats: [] };
    }
    
    chatRooms[roomName].chats.push({ username: username, message: msg });
    

    io.to(roomName).emit("chat message", { username: username, message: msg });
    console.log(chatRooms[roomName]);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
}
