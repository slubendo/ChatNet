export const database = [
  {
    id: 1,
    username: "Jimmy Smith",
    email: "jimmy123@gmail.com",
    password: "jimmy123!",
    role: "user",
  },
  {
    id: 2,
    username: "Johnny Doe",
    email: "johnny123@gmail.com",
    password: "johnny123!",
    role: "user",
  },
  {
    id: 3,
    username: "Jonathan Chen",
    email: "jonathan123@gmail.com",
    password: "jonathan123!",
    role: "user",
  },
  {
    id: 4,
    username: "Alice Alice",
    email: "alice@gmail.com",
    password: "alice123!",
    role: "admin",
  },
];

export const userModel = {
  findOne: (email) => {
    const user = database.find((user) => user.email === email);
    if (user) {
      return user;
    }
    return null;
  },

  findById: (id) => {
    const user = database.find((user) => user.id === id);
    if (user) {
      return user;
    }
    throw new Error(`Couldn't find user with id: ${id}`);
  },
};

export const addNewUser = (formData) => {
  const user = {
    id: database.length + 1,
    username: formData.username,
    email: formData.email.toLowerCase(),
    password: formData.password,
    role: "user",
  };
  console.log("user ", user);
  database.push(user);
  return user;
};

// export { database, userModel, addUserFromGithub };
