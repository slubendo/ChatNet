import passport from "passport";
import express from "express";
import { Strategy as LocalStrategy } from "passport-local";
import { userModel } from "../../prismaclient.js";

const localStrategy = new LocalStrategy(
  {
    usernameField: "email",
    passwordField: "password",
  },

  async (email, password, done) => {
    try {
      const user = await userModel.getUserByEmailAndPassword(email, password);
      const testPassword = await userModel.isUserValid(user, password);
      console.log(testPassword);
      console.log(user.password);console.log(password);
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
  let user = userModel.getUserById(id);
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
