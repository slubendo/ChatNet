import { promptMessage } from "./openai.js";
import { messageModel } from "./prismaclient.js";

async function functionForChatGpt(msg, socket, io, currentUser, chatRoomId, formattedAllChatMsg) {
  const prompt = msg.replace("@ChatGPT", "").trim();

  try {
    const response = await promptMessage({ message: prompt, type: "chat" });
    io.emit("chat message", { username: "ChatGPT", message: response });
    await messageModel.addMessage(7, chatRoomId, response, true);
  } catch (error) {
    console.error(error);
  }
}

async function functionForChatGptWithHistory(msg, socket, io, currentUser, chatRoomId, formattedAllChatMsg) {
  try {
    const response = await promptMessage({ message: JSON.stringify(formattedAllChatMsg), type: "chat" });
    io.emit("chat message", { username: "ChatGPT", message: response });
    await messageModel.addMessage(7, chatRoomId, response, true);
  } catch (error) {
    console.error(error);
  }
}

function functionForHelp(msg, socket, io) {
  io.emit("chat message", {
    username: "helper",
    message: "type @ChatGPT to prompt ChatGPT on current message, @ChatGPT -h to prompt ChatGPT for all chat history, @help for help",
  });
}

async function functionForSample(msg, socket, io, currentUser, chatRoomId, formattedAllChatMsg) {
  // Add logic for the "sample" function here
}

const keywordHandlers = {
  chatgpt: {
    default: functionForChatGpt,
    "-h": functionForChatGptWithHistory,
    "-ht": functionForSample,
  },
  help: functionForHelp,
  sample: functionForSample,
  // Add more keyword handlers here...
};

export function processInput(input, socket, io, currentUser, chatRoomId, formattedAllChatMsg) {
  input = input.trim();

  if (input.startsWith("@")) {
    const [, keyword, flags] = /^@(\w+)(?:\s+(-\w+))?(?:\s+(.*))?$/.exec(input) || [];
    // console.log("keyword:", keyword)
    // console.log("flags:", flags)

    if (keyword) {
      const lowercaseKeyword = keyword.toLowerCase();
      const handler = keywordHandlers[lowercaseKeyword];

      if (handler) {
        if (typeof handler === "function") {
          handler(input, socket, io, currentUser, chatRoomId, formattedAllChatMsg);
        } else if (flags) {
          const flagHandler = handler[flags];
          if (flagHandler && typeof flagHandler === "function") {
            flagHandler(input, socket, io, currentUser, chatRoomId, formattedAllChatMsg);
          } else {
            console.log("Invalid flag.");
          }
        } else {
          const defaultHandler = handler.default;
          if (defaultHandler && typeof defaultHandler === "function") {
            defaultHandler(input, socket, io, currentUser, chatRoomId, formattedAllChatMsg);
          } else {
            // console.log("Invalid keyword.");
          }
        }
      } else {
        // console.log("Invalid keyword.");
      }
    } else {
    //   console.log("Invalid input format.");
    }
  } else {
    // console.log('Input does not start with "@"');
  }
}
