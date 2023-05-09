import { promptMessage } from "./openai.js";
import { messageModel } from "./prismaclient.js";
import { actions } from "./actions.js";

export function handleConnection(
  socket,
  io,
  promptMessage,
  chatRoomId,
  currentUser,
  formattedAllChatMsg
) {
  socket.on("chat message", async (msg) => {
    // console.log(`message: ${msg}`);
    for (const keyword in actions) {
      if (msg.toLowerCase().includes(keyword.toLowerCase())) {
        const action = actions[keyword];
        await action(
          msg,
          socket,
          io,
          currentUser,
          chatRoomId,
          formattedAllChatMsg
        );
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
    }); 
    // Send the message to all clients
  });
}
