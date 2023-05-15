import crypto from "crypto";
import { chatModel } from "./prismaclient.js";

function generateRandomString(length) {
  const bytes = crypto.randomBytes(length);
  return bytes.toString("hex");
}

const existingChatrooms = await chatModel.getChats();

const length = 16;
const updateExsitingChatroomSecureId = async () => {
  for (const chatroom of existingChatrooms) {
    const secureId = generateRandomString(length); // Generate a random string of length 16 for the secure ID for each chatroom
    await chatModel.updateSecureId(chatroom.id, secureId);
  }
};

updateExsitingChatroomSecureId();
