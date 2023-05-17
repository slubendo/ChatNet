import { promptMessage } from "./openai.js";
import { chatModel, messageModel } from "./prismaclient.js";

export const keywordHandlers = {
  chatgpt: {
    default: functionForChatGpt,
    "h": functionForChatGptWithHistory,
    "t": functionForChatGptWithTemp,
    "ht": functionForSample,
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
  // console.log("input here: ", input)
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

async function functionForChatGptWithTemp(
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

  console.log(keywordParam)

  try {
    const response = await promptMessage({ message: prompt, type: "chat", "temperature": keywordParam });
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

  const helpMessage = "type @ChatGPT to prompt ChatGPT on current message, @ChatGPT -h to prompt ChatGPT with the chat history, @help for help"
  io.emit("chat message", {
    username: "System",
    message: helpMessage,
    chatRoomId: chatRoomId,
  });
  messageModel.addMessage(
    12,
    chatRoomId,
    helpMessage,
    false
  );
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
  const message = "Sample Message Here"
  io.emit("chat message", {
    username: "System",
    message: message,
    chatRoomId: chatRoomId,
  });
  messageModel.addMessage(
    12,
    chatRoomId,
    message,
    false
  );
}
