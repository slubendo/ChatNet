import express from "express";
import passport from "passport";
import {
  ensureAuthenticated,
  forwardAuthenticated,
} from "../middleware/checkAuth.js";
import { userModel } from "../prismaclient.js";

const auth = express.Router();

auth.get("/login", forwardAuthenticated, (req, res) => {
  res.render("login", {
    messages: req.session.messages,
  });
});

auth.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/home",
    failureRedirect: "/auth/login",
    failureMessage: true,
  })
);

auth.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) console.log(err);
  });
  res.redirect("/auth/login");
});

auth.get("/register", forwardAuthenticated, (req, res) => {
  res.render("register", {
    messages: req.session.messages,
  });
});

auth.post("/register", async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;
  const newUser = await userModel.getUserByEmail(email);
  try {
    if (username == "") {
      throw new Error("Username cannot be empty");
    } else if (password !== confirmPassword) {
      throw new Error("Passwords do not match");
    } else if (newUser) {
      // check if user already exists
      throw new Error(`User with email: ${email} already exists`);
    } else {
      const newUser = await userModel.addNewUser(req.body);
      req.login(newUser, (err) => {
        if (err) {
          console.log(err);
        }
        res.redirect("/home");
      });
      return null;
    }
  } catch (err) {
    req.session.messages = [`${err}`];
    res.redirect("/auth/register");
  }
});

//!! github login option would not be used in this app
/**
//* from passport documentation
auth.get("/github", passport.authenticate("github"));

auth.get(
  "/github/callback",
  passport.authenticate("github", {
    successRedirect: "/chatroom",
    failureRedirect: "/login",
  })
);
 */
export default auth;
