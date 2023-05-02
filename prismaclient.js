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
}

export const messageModel = {
  getMessages: async () => {
    const allMessages = await prisma.message.findMany();
    if (allMessages) {
      return allMessages;
    } else {
      return null;
    }
  },
}
