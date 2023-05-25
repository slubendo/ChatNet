import express from "express";
import passport from "passport";
import {
  ensureAuthenticated,
  forwardAuthenticated,
  clearSessionMessages,
} from "../middleware/checkAuth.js";
import { userModel } from "../prismaclient.js";

const auth = express.Router();

auth.get("/login", forwardAuthenticated, clearSessionMessages, (req, res) => {
  res.render("login", {
    messages: req.session.messages,
  });
});

auth.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.session.messages = [info.message];
      req.session.redirectFromLogin = true;
      return res.redirect("/auth/login");
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.redirect("/home");
    });
  })(req, res, next);
});

auth.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) console.log(err);
  });
  res.redirect("/auth/login");
});

auth.get(
  "/register",
  forwardAuthenticated,
  clearSessionMessages,
  (req, res) => {
    res.render("register", {
      messages: req.session.messages,
    });
  }
);

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
    req.session.redirectFromRegister = true;
    res.redirect("/auth/register");
  }
});

//@ google login option
auth.get("/google", passport.authenticate("google"));

auth.get(
  "/oauth2/redirect/google",
  passport.authenticate("google", {
    successReturnToOrRedirect: "/home",
    failureRedirect: "/login",
  })
);
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
