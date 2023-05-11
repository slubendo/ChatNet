import { promptMessage } from "./openai.js";
import { messageModel } from "./prismaclient.js";

async function functionForChatGpt(
  msg,
  socket,
  io,
  currentUser,
  chatRoomId,
  formattedAllChatMsg
) {
  const prompt = msg.replace("@ChatGPT", "").trim();

  try {
    // io.emit("chat message", { username: currentUser.username, message: msg });
    // add user's messageToChatGPT to database
    // await messageModel.addMessage(currentUser.id, chatRoomId, msg, true);

    const response = await promptMessage({ message: prompt, type: "chat" });
    io.emit("chat message", { username: "ChatGPT", message: response });

    // add ChatGPT's response to database
    await messageModel.addMessage(7, chatRoomId, response, true);
  } catch (error) {
    console.error(error);
  }
}

async function functionForChatGptWithHistory(
  msg,
  socket,
  io,
  currentUser,
  chatRoomId,
  formattedAllChatMsg
) {
  try {
    // io.emit("chat message", { username: currentUser.username, message: msg });
    // add user's messageToChatGPT to database
    // await messageModel.addMessage(currentUser.id, chatRoomId, msg, true);

    console.log("formattedAllChatMsg: ", formattedAllChatMsg)
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
}

function functionForHelp(
  msg,
  socket,
  io,
  currentUser,
  chatRoomId,
  formattedAllChatMsg
) {
  io.emit("chat message", {
    username: "helper",
    message:
      "type @ChatGPT to prompt ChatGPT on current message, @ChatGPT -h to prompt ChatGPT for all chat history, @help for help",
  });
}

async function functionForSample(
    msg,
    socket,
    io,
    currentUser,
    chatRoomId,
    formattedAllChatMsg
  ) {
    // Add your logic for the "sample" function here
  }
  
  export function processInput(
    input,
    socket,
    io,
    currentUser,
    chatRoomId,
    formattedAllChatMsg
  ) {
    // Remove leading and trailing whitespaces
    input = input.trim();
  
    // Check if input starts with '@'
    if (input.startsWith("@")) {
      // Extract the keyword and flags
      const [, keyword, flags] = /^@(\w+)(?:\s+(.*))?$/.exec(input) || [];
  
      if (keyword) {
        const lowercaseKeyword = keyword.toLowerCase();
  
        // Trigger functions based on the keyword
        switch (lowercaseKeyword) {
          case "chatgpt":
            if (flags && flags.includes("-h")) {
              functionForChatGptWithHistory(
                input,
                socket,
                io,
                currentUser,
                chatRoomId,
                formattedAllChatMsg
              );
            } else if (flags && flags.includes("-ht")) {
              functionForSample(
                input,
                socket,
                io,
                currentUser,
                chatRoomId,
                formattedAllChatMsg
              );
            } else {
              functionForChatGpt(
                input,
                socket,
                io,
                currentUser,
                chatRoomId,
                formattedAllChatMsg
              );
            }
            break;
          case "help":
            functionForHelp(
              input,
              socket,
              io,
              currentUser,
              chatRoomId,
              formattedAllChatMsg
            );
            break;
          case "sample":
            functionForSample(
              input,
              socket,
              io,
              currentUser,
              chatRoomId,
              formattedAllChatMsg
            );
            break;
          // Add more cases for other keywords...
  
          default:
            // Keyword not recognized
            console.log("Invalid keyword.");
            break;
        }
      } else {
        console.log("Invalid input format.");
      }
    } else {
      console.log('Input does not start with "@"');
    }
  }
