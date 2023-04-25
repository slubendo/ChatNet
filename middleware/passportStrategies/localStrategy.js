import passport from "passport";
import express from "express";
import { Strategy as LocalStrategy } from "passport-local";
import {
  getUserByEmailIdAndPassword,
  getUserById,
} from "../../controllers/userController";
import { PassportStrategy } from "../../interfaces/index";

const localStrategy = new LocalStrategy(
  {
    usernameField: "email",
    passwordField: "password",
  },

  //below is how you talk to the database
  async (email, password, done) => {
    try {
      const user = await getUserByEmailIdAndPassword(email, password);
      if (user) return done(null, user);

      // when call done(), the user comes from the database, and will send the user to the serializeUser function below to create/store it inside the session.
    } catch (err) {
      return done(null, false, { message: err.message });
    }
  }
);

passport.serializeUser(function (
  user,
  done
) {
  done(null, (user).id); // typically if we declare and merge a interface with the passport global interface, you don't need to put as any in there.
});
// when the function run, it means the user has been validated, it will store the user in the session. But not the whole user, just ID. Why?  By doing this, you save the time for yourself and skipping the database validation.

passport.deserializeUser(function (
  id,
  done
) {
  let user = getUserById(id);
  if (user) {
    done(null, user);
  } else {
    done({ message: "User not found" }, null);
  }
});

const passportLocalStrategy = {
  name: "local",
  strategy: localStrategy,
};

export default passportLocalStrategy;
