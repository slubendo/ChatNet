import passport from "passport";
import express from "express";
import { Strategy as LocalStrategy } from "passport-local";
import {
  getUserByEmailIdAndPassword,
  getUserById,
} from "../../userController.js";
import { addNewUser } from "../../userModel.js";

const localStrategy = new LocalStrategy(
  {
    usernameField: "email",
    passwordField: "password",
  },

  async (email, password, done) => {
    try {
      const user = await getUserByEmailIdAndPassword(email, password);
      if (user) return done(null, user);
    } catch (err) {
      return done(null, false, { message: err.message });
    }
  }
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  let user = getUserById(id);
  if (user) {
    done(null, user);
  } else {
    done({ message: "User not found" }, null);
  }
});

export const passportLocalStrategy = {
  name: "local",
  strategy: localStrategy,
};

// export default passportLocalStrategy;
