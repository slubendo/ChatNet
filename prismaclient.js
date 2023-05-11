import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


export const userModel = {
  getUsers: async () => {
    const allUsers = await prisma.user.findMany();
    if (allUsers) {
      return allUsers;
    } else {
      return null;
    }
  },
  getUserByEmail: async (email) => {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (user) {
      return user;
    } else {
      return null;
    }
  },
  getUserById: async (id) => {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });
    if (!user) {
      throw new Error(`Couldn't find user with id: ${id}`);
    }
    return user;
  },
  getUserByEmailAndPassword: async (email, password) => {
    const user = await userModel.getUserByEmail(email);
    if (user) {
      let valid = await userModel.isUserValid(user, password);
      if (valid) {
        return user;
      } else {
        throw new Error("Password is incorrect");
      }
    } else {
      throw new Error(`Couldn't find user with email: ${email}`);
    }
  },
  isUserValid: async (user, password) => {
    return user.password === password;
  },
  addNewUser: async (user) => {
    try {
      const newUser = await prisma.user.create({
        data: {
          username: user.username,
          email: user.email,
          password: user.password,
        },
      });
      return newUser;
    } catch (err) {
      throw new Error("Fail to create new user: ", err);
    }
  },
};

export const chatModel = {
  getChats: async () => {
    const allChat = await prisma.chat.findMany();
    if (allChat) {
      return allChat;
    } else {
      return null;
    }
  },
  getChatById: async (id) => {
    const chat = await prisma.chat.findUnique({
      where: {
        id,
      },
    });
    if (!chat) {
      throw new Error(`Couldn't find chat with id: ${id}`);
    }
    return chat;
  },
  createNewChat: async (chatName, creatorUserId) => {
    try {
      const newChat = await prisma.chat.create({
        data: {
          name: chatName,
          adminId: creatorUserId,
          members: {
            connect: [{ id: creatorUserId }, { id: 7 }],
          },
        },
      });
      return newChat;
    } catch (err) {
      throw new Error("Fail to create new chat: ", err);
    }
  },
  addChatMember: async (chatId, memberId) => {
    const chat = await prisma.chat.findUnique({
      where: {
        id: chatId,
      },
      include: {
        members: true,
      },
    });

    if (!chat) {
      throw new Error(`Chat with ID ${chatId} not found`);
    }

    const existingMember = chat.members.find(
      (member) => member.id === memberId
    );

    if (existingMember) {
      throw new Error(
        `User with ID ${memberId} is already a member of this chat`
      );
    }

    const updatedChat = await prisma.chat.update({
      where: {
        id: chatId,
      },
      data: {
        members: {
          connect: {
            id: memberId,
          },
        },
      },
      include: {
        members: true,
      },
    });
    return updatedChat;
  },
  getMembersOfChat: async function getMembersOfChat(chatId) {
    const chat = await prisma.chat.findUnique({
      where: {
        id: chatId,
      },
      include: {
        members: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    if (!chat) {
      throw new Error(`Couldn't find chat with id: ${chatId}`);
    }

    return chat.members.map((member) => ({
      memberId: member.id,
      memberName: member.username,
      memberEmail: member.email,
    }));
  },
  getChatsByUserId: async (userId) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { chats: true },
    });

    if (!user) {
      throw new Error(`User not found with ID ${userId}`);
    }

    return user.chats;
  },
  getAdminOfChat: async (chatId) => {
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        admin: true,
      },
    });
    return chat.admin;
  },
  deleteAllMessagesInChat: async (chatId) => {
    const deletedMessages = await prisma.message.deleteMany({
      where: {
        chatId,
      },
    });
    return deletedMessages;
  },

  // currently not working
  // deleteChatRoom: async (chatId) => {
  //   const deletedChat = await prisma.chat.delete({
  //     where: {
  //       id: chatId,
  //     },
  //   });
  //   return deletedChat;
  // },
  getMostRecentMessage: async (chatId) => {
    const message = await prisma.message.findFirst({
      where: {
        chatId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  
    if (!message) {
      // throw new Error(`No messages found in chat with id: ${chatId}`);
      return null;
    }
  
    return message;
  },
};  

export const messageModel = {
  getMessages: async () => {
    const allMessages = await prisma.message.findMany();
    if (allMessages) {
      return allMessages;
    } else {
      return null;
    }
  },
  addMessage: async (senderId, chatId, message, isChatGPT) => {
    try {
      const newMessage = await prisma.message.create({
        data: {
          text: message,
          senderId: senderId,
          chatId: chatId,
          isChatGPT: isChatGPT,
        },
      });
      return newMessage;
    } catch (err) {
      throw new Error("Fail to create new message: ", err);
    }
  },
  getMessagesByChatId: async (chatId) => {
    const allMessages = await prisma.message.findMany({
      where: {
        chatId: parseInt(chatId),
      },
      include: {
        sender: true,
      },
    });
    if (allMessages) {
      return allMessages;
    } else {
      return null;
    }
  },
};
