import { promptMessage } from "./openai.js";
import { chatModel, messageModel } from "./prismaclient.js";

export const keywordHandlers = {
  chatgpt: {
    default: functionForChatGpt,
    h: functionForChatGptWithHistory,
    t: functionForChatGptWithTemp,
    ht: functionForSample,
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
    const systemMessage =
      "You are ChatGPT, an AI assistant in a groupchat. Respond with the answer in plain text without formatting.";
    const response = await promptMessage({
      message: prompt,
      type: "chat",
      systemMessage: systemMessage,
    });
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
    const systemMessage =
      "You are ChatGPT, an AI assistant in a groupchat. A user has prompted you with @chatgpt -h <user prompt>. The -h flag provides you with the chatroom message history. The history is formatted as member and message in json format. This history will include past ChatGPT prompts and answers. Respond with the answer in plain text without formatting. Only answer the current prompt, not previous prompts from the history";
    const messageHistory = await messageModel.getMessagesByChatId(chatRoomId);

    const formattedMessageHistory = messageHistory.map((chatmsg) => {
      return { username: chatmsg.sender.username, content: chatmsg.text };
    });
    const prompt = input + JSON.stringify(formattedMessageHistory);

    const response = await promptMessage({
      message: prompt,
      type: "chat",
      systemMessage: systemMessage,
    });

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

<<<<<<< HEAD
  console.log(keywordParam);

  try {
    const response = await promptMessage({
      message: prompt,
      type: "chat",
      temperature: keywordParam,
=======
  // console.log("keywordParameter: ", keywordParam)

  try {
    const systemMessage =
      "You are ChatGPT, an AI assistant in a groupchat. A user has prompted you with @chatgpt(<temperature>) -t <user prompt>. The -t flag lets the user manually change the temperature. Respond with your answer in plain text without formatting.";
    const response = await promptMessage({
      message: prompt,
      type: "chat",
      temp: keywordParam,
      systemMessage: systemMessage,
>>>>>>> 1648e43ed46b820dfbbbf52452b5c1983957fb4e
    });
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

<<<<<<< HEAD
async function functionForHelp(
=======
function functionForHelp(
>>>>>>> 1648e43ed46b820dfbbbf52452b5c1983957fb4e
  input,
  socket,
  io,
  currentUser,
  chatRoomId,
  formattedAllChatMsg,
  allChatMsg,
  keywordParam
) {
  const helpMessage =
    "type @ChatGPT to prompt ChatGPT on current message, @ChatGPT -h to prompt ChatGPT with the chat history, @help for help";
<<<<<<< HEAD
  await messageModel.addMessage(12, chatRoomId, helpMessage, false);
=======
>>>>>>> 1648e43ed46b820dfbbbf52452b5c1983957fb4e
  io.emit("chat message", {
    username: "System",
    message: helpMessage,
    chatRoomId: chatRoomId,
  });
<<<<<<< HEAD
=======
  messageModel.addMessage(12, chatRoomId, helpMessage, false);
>>>>>>> 1648e43ed46b820dfbbbf52452b5c1983957fb4e
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
  const message = "Sample Message Here";
  io.emit("chat message", {
    username: "System",
    message: message,
    chatRoomId: chatRoomId,
  });
  messageModel.addMessage(12, chatRoomId, message, false);
}
