import { promptMessage } from "./openai.js";
import { messageModel } from "./prismaclient.js";
import { processInput } from "./inputProcessor.js";

export function handleConnection(
  socket,
  io,
  promptMessage,
  currentUser,
  chatRoomId,
  formattedAllChatMsg,
  allChatMsg,
) {
  socket.on("chat message", async (msg) => {
    processInput(msg, socket, io, currentUser, chatRoomId, formattedAllChatMsg, allChatMsg,);

    const parsedUserInfo = JSON.parse(currentUser)

    let newMessage = await messageModel.addMessage(
      parseInt(parsedUserInfo.id),
      chatRoomId,
      msg,
      false
    );
    // Send the message to all clients
    io.emit("chat message", {
      username: parsedUserInfo.username,
      message: newMessage.text,
      chatRoomId: chatRoomId,
    });
  });
}
