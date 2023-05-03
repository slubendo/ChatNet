import { promptMessage } from "./openai.js";
import { userModel, messageModel } from "./prismaclient.js";

const actions = {
  "@ChatGPT": async (msg, socket, io, currentUser, chatRoomId, allChatMsg) => {
    const prompt = msg.replace("@ChatGPT", "").trim();

    try {
      io.emit("chat message", { username: currentUser.username, message: msg });
      // add user's messageToChatGPT to database
      await messageModel.addMessage(currentUser.id, chatRoomId, msg, true);

      const response = await promptMessage({ message: prompt, type: "chat" });
      io.emit("chat message", { username: "ChatGPT", message: response });

      // add ChatGPT's response to database
      await messageModel.addMessage(7, chatRoomId, response, true);
    } catch (error) {
      console.error(error);
    }
  },
  "@ChatGPT -h": async (
    msg,
    socket,
    io,
    currentUser,
    chatRoomId,
    allChatMsg
  ) => {
    try {
      io.emit("chat message", { username: currentUser.username, message: msg });
      // add user's messageToChatGPT to database
      await messageModel.addMessage(currentUser.id, chatRoomId, msg, true);

      const response = await promptMessage({
        message: JSON.stringify(allChatMsg),
        type: "chat",
      });

      io.emit("chat message", { username: "ChatGPT", message: response });
      // add ChatGPT's response to database
      await messageModel.addMessage(7, chatRoomId, response, true);
    } catch (error) {
      console.error(error);
    }
  },

  "@help": async (msg, socket, io, currentUser, chatRoomId, allChatMsg) => {
    io.emit("chat message", {
      username: "helper",
      message:
        "type @ChatGPT to prompt ChatGPT on current message, @ChatGPT -h to prompt ChatGPT for all chat history, @help for help",
    });
  },

  // Add more actions here as needed
};

export function handleConnection(
  socket,
  io,
  promptMessage,
  chatRoomId,
  currentUser,
  allChatMsg
) {
  socket.on("chat message", async (msg) => {
    // console.log("currentUser from socket.js: ", currentUser.id);
    // console.log("chatRoomId from socket.js: ", chatRoomId);
    // console.log(`message: ${msg}`);
    for (const keyword in actions) {
      if (msg.toLowerCase().includes(keyword.toLowerCase())) {
        const action = actions[keyword];
        await action(msg, socket, io, currentUser, chatRoomId, allChatMsg);
        return;
      }
    }
    // add new message to database
    let newMessage = await messageModel.addMessage(
      currentUser.id,
      chatRoomId,
      msg,
      false
    );

    io.emit("chat message", {
      username: currentUser.username,
      message: newMessage.text,
    }); // Send the message to all clients
  });
}
