import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // ... you will write your Prisma Client queries here
  const allChat = await prisma.chat.findMany();
  console.log(allChat);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

  export const userModel = {
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
          id: Number(id),
        },
      });
      if (!user) {
        throw new Error("Couldn't find user with id: ${id}");
      }
      return user;
    },
    getUserByEmailAndPassword: async (email, password) => {
      const user = await userModel.getUserByEmail(email);
      if (user) {
        if (userModel.isUserValid(user, password)) {
          return user;
        } else {
          throw new Error("Password is incorrect");
        }
      } else {
        throw new Error("Couldn't find user with email: ${email}");
      }
    },
    isUserValid: async (user, password) => {
      return user.password === password;
    },
  };
  
  export const messageModel = {
    getChats: async () => {
      const allChat = await prisma.chat.findMany();
      if (allChat) {
        return allChat;
      } else {
        return null;
      }
    },
  }