import { PrismaClient } from "@prisma/client";
import cuid from "cuid";

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
  createNewChat: async (chatName, creatorUserId) => {
    try {
      const newChat = await prisma.chat.create({
        data: {
          // id,
          name: chatName,
          adminId: creatorUserId,
          members: {
            connect: [{ id: creatorUserId }, { id: 4 }],
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
        `User with ID ${existingMember.email} is already a member of this chat`
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
  removeUserFromChat: async (chatId, memberId) => {
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

    let updatedChat;
    if (chat.adminId === memberId) {
      // If the member being removed is the admin, update the adminId to be the id of the next member in the chat
      const nextAdmin = chat.members.find(
        (member) => member.id !== memberId && member.id !== 4
      );
      if (nextAdmin){
        updatedChat = await prisma.chat.update({
          where: {
            id: chatId,
          },
          data: {
            members: {
              disconnect: {
                id: memberId,
              },
            },
            adminId: nextAdmin.id,
          },
        });
      } else {
        // If there are no other members in the chat, delete the chat
        await chatModel.deleteChatByChatId(chatId);
        updatedChat = "deleted";
      }
    } else {
      // If the member being removed is not the admin, just remove them from the chat
      updatedChat = await prisma.chat.update({
        where: {
          id: chatId,
        },
        data: {
          members: {
            disconnect: {
              id: memberId,
            },
          },
        },
      });
    }
    return updatedChat;
  },
  deleteChatByChatId: async (chatId) => {
    try {
      // Delete all messages that have their chatId field set to the id of the chat being deleted
      await chatModel.deleteAllMessagesInChat(chatId);

      // Delete the chat
      await prisma.chat.delete({
        where: {
          id: chatId,
        },
      });
    } catch (error) {
      console.log(error);
    }
  },
  deleteAllMessagesInChat: async (chatId) => {
    const deletedMessages = await prisma.message.deleteMany({
      where: {
        chatId,
      },
    });
    return deletedMessages;
  },
  getMostRecentMessage: async (chatId) => {
    const message = await prisma.message.findFirst({
      where: {
        chatId,
      },
      orderBy: {
        createdAt: "desc",
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
        chatId: chatId,
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
