import { json } from "stream/consumers";
import { promptMessage } from "./openai.js";
import { chatModel, messageModel } from "./prismaclient.js";

export const keywordHandlers = {
  chatgpt: chatGptHandler,
  help: functionForHelp,
  sample: functionForSample,
  clearchat: functionForDeleteChatroomMessages,
  // Add more keyword handlers here...
};

async function chatGptHandler(
  input,
  socket,
  io,
  currentUser,
  chatRoomId,
  formattedAllChatMsg,
  allChatMsg,
  keywordParam,
  inputObj
) {
  const flags = inputObj.flags.map((obj) => obj.flag); // Extract the flags from the inputObj

  const flagActions = {
    0: () =>
      functionForChatGpt(
        input,
        socket,
        io,
        currentUser,
        chatRoomId,
        formattedAllChatMsg,
        allChatMsg,
        keywordParam,
        inputObj
      ),
    1: {
      h: () =>
        functionForChatGptWithHistory(
          input,
          socket,
          io,
          currentUser,
          chatRoomId,
          formattedAllChatMsg,
          allChatMsg,
          keywordParam
        ),
      t: () =>
        functionForChatGptWithTemp(
          input,
          socket,
          io,
          currentUser,
          chatRoomId,
          formattedAllChatMsg,
          allChatMsg,
          inputObj.flags[0].parameter
        ),
    },
    2: {
      ht: () => {
        const requiredFlags = ["h", "t"];
        // console.log("h, t flags exist.");
        functionForChatGptWithHistoryTemp(
          input,
          socket,
          io,
          currentUser,
          chatRoomId,
          formattedAllChatMsg,
          allChatMsg,
          inputObj.flags[0].parameter,
          inputObj.flags[1].parameter
        );
        inputObj.flags.forEach((obj) => {
          if (requiredFlags.includes(obj.flag)) {
            // console.log(obj.flag, "flag, parameter:", obj.parameter);
          }
        });
      },
      hi: () => {
        const requiredFlags = ["h", "i"];
        // console.log("h, i flags exist.");
        inputObj.flags.forEach((obj) => {
          if (requiredFlags.includes(obj.flag)) {
            // console.log(obj.flag, "flag, parameter:", obj.parameter);
          }
        });
      },
    },
  };

  const flagCount = flags.length;
  const flagKeys = flags.join("");

  if (flagActions[flagCount]) {
    if (typeof flagActions[flagCount] === "function") {
      flagActions[flagCount]();
    } else if (flagActions[flagCount][flagKeys]) {
      flagActions[flagCount][flagKeys]();
    }
  }
}

async function functionForChatGpt(
  input,
  socket,
  io,
  currentUser,
  chatRoomId,
  formattedAllChatMsg,
  allChatMsg,
  keywordParam,
  inputObj
) {
  try {
    const prompt = input;
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
  try {
    const systemMessage =
      "You are ChatGPT, an AI assistant in a groupchat. A user has prompted you with @chatgpt -h <user prompt>. The -h flag provides you with the chatroom message history. The history is formatted as member and message in json format. This history will include past ChatGPT prompts and answers. Respond with the answer in plain text without formatting. Only answer the current prompt, not previous prompts from the history";
    const messageHistory = await messageModel.getMessagesByChatId(chatRoomId);

    const formattedMessageHistory = messageHistory.map((chatmsg) => {
      return { username: chatmsg.sender.username, content: chatmsg.text };
    });
    const prompt =
      "current prompt: " +
      input +
      " history: " +
      JSON.stringify(formattedMessageHistory);

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
  inputObj
) {
  const prompt = input;
  // console.log("inputObj: ", inputObj);

  try {
    const systemMessage =
      "You are ChatGPT, an AI assistant in a groupchat. A user has prompted you with @chatgpt. Respond with your answer in plain text without formatting.";
    const response = await promptMessage({
      message: prompt,
      type: "chat",
      temp: inputObj,
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

async function functionForChatGptWithHistoryTemp(
  input,
  socket,
  io,
  currentUser,
  chatRoomId,
  formattedAllChatMsg,
  allChatMsg,
  keywordParam,
  inputObj
) {
  try {
    const systemMessage =
      "You are ChatGPT, an AI assistant in a groupchat. A user has prompted you with @chatgpt -h <user prompt>. The -h flag provides you with the chatroom message history. The history is formatted as member and message in json format. This history will include past ChatGPT prompts and answers. Respond with the answer in plain text without formatting. Only answer the current user's prompt, not previous prompts from the history";
    const messageHistory = await messageModel.getMessagesByChatId(chatRoomId);

    const formattedMessageHistory = messageHistory.map((chatmsg) => {
      return { username: chatmsg.sender.username, content: chatmsg.text };
    });
    const prompt =
      "current prompt: " +
      input +
      " history: " +
      JSON.stringify(formattedMessageHistory);

    // console.log("-ht inputObj: ", inputObj);
    const response = await promptMessage({
      message: prompt,
      type: "chat",
      systemMessage: systemMessage,
      temp: inputObj,
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

async function functionForHelp(
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
  await io.emit("chat message", {
    username: "System",
    message: helpMessage,
    chatRoomId: chatRoomId,
  });
  await messageModel.addMessage(5, chatRoomId, helpMessage, false);
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
  messageModel.addMessage(5, chatRoomId, message, false);
}
