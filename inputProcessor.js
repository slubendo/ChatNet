import { keywordHandlers } from "./actions.js";

export function processInput(
  input,
  socket,
  io,
  currentUser,
  chatRoomId,
  formattedAllChatMsg,
  allChatMsg,
) {
  input = input.trim();

  if (input.startsWith("@")) {
    const [, keyword, flags] =
      /^@(\w+)(?:\s+(-\w+))?(?:\s+(.*))?$/.exec(input) || [];
    // console.log("keyword:", keyword);
    // console.log("flags:", flags);

    if (keyword) {
      const lowercaseKeyword = keyword.toLowerCase();
      const handler = keywordHandlers[lowercaseKeyword];

      if (handler) {
        if (typeof handler === "function") {
          handler(
            input,
            socket,
            io,
            currentUser,
            chatRoomId,
            formattedAllChatMsg,
            allChatMsg,
          );
        } else if (flags) {
          const flagHandler = handler[flags];
          if (flagHandler && typeof flagHandler === "function") {
            flagHandler(
              input,
              socket,
              io,
              currentUser,
              chatRoomId,
              formattedAllChatMsg,
              allChatMsg,
            );
          } else {
            // console.log("Invalid flag.");
          }
        } else {
          const defaultHandler = handler.default;
          if (defaultHandler && typeof defaultHandler === "function") {
            defaultHandler(
              input,
              socket,
              io,
              currentUser,
              chatRoomId,
              formattedAllChatMsg,
              allChatMsg,
            );
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
