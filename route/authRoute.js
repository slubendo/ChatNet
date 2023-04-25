import express from "express";
import passport from "passport";
import {
  ensureAuthenticated,
  forwardAuthenticated,
} from "../middleware/checkAuth";

const auth = express.Router();

auth.get("/login", forwardAuthenticated, (req, res) => {
  res.render("login", {
    messages: req.session.messages,
  });
});

// ts does not know req.session - which is from express module. ts doesn't know what are available in req.session. So set it to "as any" can  solve the problem

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
