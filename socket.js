import { promptMessage } from "./openai.js";
import { messageModel } from "./prismaclient.js";
import { processInput } from "./inputProcessor.js";
import MarkdownIt  from 'markdown-it';
import hljs from 'highlight.js';

const md = new MarkdownIt({
  highlight: function (str, lang) {
        return '<pre class="hljs"><code>' +
               hljs.highlightAuto(str).value +
               '</code></pre>';
  }
});

export function handleConnection(
  socket,
  io,
  promptMessage,
  chatRoomId,
  currentUser,
  formattedAllChatMsg,
  allChatMsg,
) {
  // console.log("formattedAllChatMsgWithDate: ", formattedAllChatMsgWithDate)
  socket.on("chat message", async (msg) => {
    processInput(msg, socket, io, currentUser, chatRoomId, formattedAllChatMsg, allChatMsg,);

    // add new message to database
    // console.log("currentUser.id, chatRoomId, msg ======>"+currentUser.id, chatRoomId, msg)
    const parsedUserInfo = JSON.parse(currentUser)
    console.log(parsedUserInfo.username)

    let newMessage = await messageModel.addMessage(
      parseInt(parsedUserInfo.id),
      chatRoomId,
      msg,
      false
    );
    // Send the message to all clients
    io.emit("chat message", {
      username: parsedUserInfo.username,
      message: md.render(newMessage.text),
      chatRoomId: chatRoomId,
    });
  });
}
