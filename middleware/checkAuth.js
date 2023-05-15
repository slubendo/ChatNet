import { userModel, chatModel, messageModel } from "../prismaclient.js";
export const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/auth/login");
};

export const forwardAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect("/home");
};

export const checkRoomAuthorization = async (req, res, next) => {
  const chatroomId = parseInt(req.params.chatRoomId);
  const user = await req.user;
  const userId = user.id;

  try {
    let userChats = await chatModel.getChatsByUserId(userId);
    userChats = userChats.map((chat) => chat.id);

    if (userChats.includes(chatroomId)) {
      next();
    } else {
      // User is not authorized, return 404
      res.status(404).send("Page Not Found");
    }
  } catch (error) {
    // Handle database errors
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
