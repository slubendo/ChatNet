import { promptMessage } from "./openai.js";
import { chatModel, messageModel } from "./prismaclient.js";

export const keywordHandlers = {
  chatgpt: {
    default: functionForChatGpt,
    "-h": functionForChatGptWithHistory,
    "-ht": functionForSample,
  },
  help: functionForHelp,
  sample: functionForSample,
  clearchat: functionForDeleteChatroomMessages,
  // Add more keyword handlers here...
};

async function functionForChatGpt(
  input,
  socket,
  io,
  currentUser,
  chatRoomId,
  formattedAllChatMsg,
  allChatMsg,
  keywordParam
) {
  const prompt = input.replace("@ChatGPT", "").trim();

  try {
    const response = await promptMessage({ message: prompt, type: "chat" });
    io.emit("chat message", {
      username: "ChatGPT",
      message: response.htmlResponse,
      chatRoomId: chatRoomId,
    });
    await messageModel.addMessage(
      4,
      chatRoomId,
      response.markdownDatabase,
      true
    );
  } catch (error) {
    console.error(error);
  }
}

async function functionForChatGptWithHistory(
  input,
  socket,
  io,
  currentUser,
  chatRoomId,
  formattedAllChatMsg,
  allChatMsg,
  keywordParam
) {
  try {
    const messageHistory = await messageModel.getMessagesByChatId(chatRoomId);

    const formattedMessageHistory = messageHistory.map((chatmsg) => {
      return { username: chatmsg.sender.username, content: chatmsg.text };
    });
    const prompt =
      input + JSON.stringify(formattedMessageHistory);

    const response = await promptMessage({ message: prompt, type: "chat" });

    io.emit("chat message", {
      username: "ChatGPT",
      message: response.htmlResponse,
      chatRoomId: chatRoomId,
    });
    await messageModel.addMessage(
      4,
      chatRoomId,
      response.markdownDatabase,
      true
    );
  } catch (error) {
    console.error(error);
  }
}

function functionForHelp(input, socket, io, currentUser, chatRoomId, formattedAllChatMsg, allChatMsg, keywordParam) {
  io.emit("chat message", {
    username: "helper",
    message:
      "type @ChatGPT to prompt ChatGPT on current message, @ChatGPT -h to prompt ChatGPT for all chat history, @help for help",
  });
}

async function functionForDeleteChatroomMessages(
  input,
  socket,
  io,
  currentUser,
  chatRoomId,
  formattedAllChatMsg,
  allChatMsg,
  keywordParam
) {
  await chatModel.deleteAllMessagesInChat(chatRoomId);
}

async function functionForSample(
  input,
  socket,
  io,
  currentUser,
  chatRoomId,
  formattedAllChatMsg,
  allChatMsg,
  keywordParam
) {
  // Add logic for the "sample" function here
}
