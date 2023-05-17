import { keywordHandlers } from "./actions.js";

export function processInput(
  input,
  socket,
  io,
  currentUser,
  chatRoomId,
  formattedAllChatMsg,
  allChatMsg
) {
  input = input.trim();

  if (!input.startsWith("@")) {
    // console.log('Input does not start with "@"');
    return;
  }

  const regex =
    /^@(\w+)(?:\((.*?)\))?((?:\s+-\w+(?:\([^)]*\))?)*)(?:\s+(.*))?$/;
  const [, keyword, keywordParam, flagMatches, content] = regex.exec(input) || [];

  const flags = [];
  const flagRegex = /(-\w+)(?:\((.*?)\))?/g;
  let match;
  while ((match = flagRegex.exec(flagMatches)) !== null) {
    const [, flag, flagParam] = match;
    const flagObj = { flag: flag.substring(1) };
    if (flagParam) {
      flagObj.parameter = flagParam;
    }
    flags.push(flagObj);
  }

  console.log("\n");
  console.log("keyword:", keyword);
  console.log("keywordParam:", keywordParam);
  console.log("flags:", flags);
  console.log("content:", content);

  if (!keyword) {
    // console.log("Invalid input format.");
    return;
  }

  const lowercaseKeyword = keyword.toLowerCase();
  const handler = keywordHandlers[lowercaseKeyword];

  if (!handler) {
    // console.log("Invalid keyword.");
    return;
  }

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
  } else {
    const flag = flags[0];
    if (flag) {
      const flagWithoutParam = flag.flag; // Remove the leading "-"
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
          flag.parameter
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
  }
}
