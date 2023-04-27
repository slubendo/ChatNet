import express from "express";
import passport from "passport";
import {
  ensureAuthenticated,
  forwardAuthenticated,
} from "../middleware/checkAuth.js";
import { addNewUser, userModel } from "../userModel.js";
import { checkExistingEmail } from "../userController.js";

const auth = express.Router();

auth.get("/login", forwardAuthenticated, (req, res) => {
  res.render("login", {
    messages: req.session.messages,
  });
});

auth.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
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

auth.get("/register", (req, res) => {
  res.render("register", {
    messages: req.session.messages,
  });
});

auth.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // check if user already exists
    const existingUser = await userModel.findOne(email);
    console.log("existingUser ", existingUser);
    if (existingUser) {
      req.session.messages = [`User with email: ${email} already exists`];
      res.redirect("/auth/register");
    } else {
      const newUser = await addNewUser(req.body);

      req.login(newUser, (err) => {
        if (err) {
          console.log(err);
        }
        res.redirect("/");
      });
    }
  } catch (err) {
    console.log(err);
    req.session.messages = ["Internal server error"];
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
