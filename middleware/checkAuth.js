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
  const chatroomId = parseInt(req.params.chatroomId); 
  const userId = req.user.id; 

  let userChats = await chatModel.getChatsByUserId(userId);
  userChats = userChats.map((chat) => chat.id);

  console.log(userChats);

  try {
    userChats.forEach((chat) => {
      if (chat.id === chatroomId) {
        next();
      } else {
        // User is not authorized, return 404
        res.status(404).send("Page Not Found");
      }
    });
  } catch {
    (error) => {
      // Handle database errors
      console.error(error);
      res.status(500).send("Internal Server Error");
    };
  }
};
