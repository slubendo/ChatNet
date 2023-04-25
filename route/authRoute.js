import express from "express";
import passport from "passport";
import {
  ensureAuthenticated,
  forwardAuthenticated,
} from "../middleware/checkAuth.js";

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

//* from passport documentation
auth.get("/github", passport.authenticate("github"));

auth.get(
  "/github/callback",
  passport.authenticate("github", {
    successRedirect: "/",
    failureRedirect: "/login",
  })
);

export default auth;
