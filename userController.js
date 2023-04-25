import { userModel } from "userModel";

const getUserByEmailIdAndPassword = (email, password) => {
  let user = userModel.findOne(email);
  if (user) {
    if (isUserValid(user, password)) {
      return user;
    } else {
      throw new Error("Password is incorrect");
    }
  } else {
    throw new Error(`Couldn't find user with email: ${email}`);
  }
};

const getUserById = (id) => {
  try {
    let user = userModel.findById(id);
    if (user) {
      return user;
    }
  } catch (err) {
    return null;
  }
};

function isUserValid(user, password) {
  return user.password === password;
}

export { getUserByEmailIdAndPassword, getUserById, isUserValid };
