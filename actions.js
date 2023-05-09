import { promptMessage } from "./openai.js";
import { messageModel } from "./prismaclient.js";

export const actions = {
    "@ChatGPT -h": async (
      msg,
      socket,
      io,
      currentUser,
      chatRoomId,
      formattedAllChatMsg
    ) => {
      try {
        io.emit("chat message", { username: currentUser.username, message: msg });
        // add user's messageToChatGPT to database
        await messageModel.addMessage(currentUser.id, chatRoomId, msg, true);
        
        const response = await promptMessage({
          message: JSON.stringify(formattedAllChatMsg),
          type: "chat",
        });
  
        io.emit("chat message", { username: "ChatGPT", message: response });
  
        // add ChatGPT's response to database
        await messageModel.addMessage(7, chatRoomId, response, true);
      } catch (error) {
        console.error(error);
      }
    },
    "@ChatGPT": async (
      msg,
      socket,
      io,
      currentUser,
      chatRoomId,
      formattedAllChatMsg
    ) => {
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
    "@help": async (
      msg,
      socket,
      io,
      currentUser,
      chatRoomId,
      formattedAllChatMsg
    ) => {
      io.emit("chat message", {
        username: "helper",
        message:
          "type @ChatGPT to prompt ChatGPT on current message, @ChatGPT -h to prompt ChatGPT for all chat history, @help for help",
      });
    },
  
    // Add more actions here as needed
  };