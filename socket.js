import { promptMessage } from "./openai.js";
import { messageModel } from "./prismaclient.js";
import { processInput } from "./inputProcessor.js";

export function handleConnection(
  socket,
  io,
  promptMessage,
  chatRoomId,
  currentUser,
  formattedAllChatMsg,
) {
  // console.log("formattedAllChatMsgWithDate: ", formattedAllChatMsgWithDate)
  socket.on("chat message", async (msg) => {
    processInput(msg, socket, io, currentUser, chatRoomId, formattedAllChatMsg, );

    // add new message to database
    let newMessage = await messageModel.addMessage(
      currentUser.id,
      chatRoomId,
      msg,
      false
    );

    // Send the message to all clients
    io.emit("chat message", {
      username: currentUser.username,
      message: newMessage.text,
    });
  });
}
