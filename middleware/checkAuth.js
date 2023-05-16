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

export const clearSessionMessages = (req, res, next) => {
  if (!req.session.redirectFromRegister && !req.session.redirectFromLogin) {
    req.session.messages = [];
  }
  req.session.redirectFromRegister = false;
  req.session.redirectFromLogin = false;
  next();
};

export const checkRoomAuthorization = async (req, res, next) => {
  const chatroomId = req.params.chatRoomId;
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
