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
    const [, keyword, keywordParam, flag, flagParam, content] =
      /^@(\w+)(?:\((.*?)\))?(?:\s+(-\w+)(?:\((.*?)\))?)?(?:\s+(.*))?$/.exec(
        input
      ) || [];
      console.log("\n")
    console.log("keyword:", keyword);
    console.log("keywordParam:", keywordParam);
    console.log("flag:", flag);
    console.log("flagParam:", flagParam);
    console.log("content:", content);

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
            keywordParam
          );
        } else if (flag) {
          const flagWithoutParam = flag.slice(1); // Remove the leading "-"
          const flagHandler = handler[flagWithoutParam];
          if (flagHandler && typeof flagHandler === "function") {
            flagHandler(
              input,
              socket,
              io,
              currentUser,
              chatRoomId,
              formattedAllChatMsg,
              allChatMsg,
              flagParam
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
              keywordParam
            );
          } else {
            // console.log("Invalid keyword.");
          }
        }
      } else {
        // console.log("Invalid keyword.");
      }
    } else {
      // console.log("Invalid input format.");
    }
  } else {
    // console.log('Input does not start with "@"');
  }
}
