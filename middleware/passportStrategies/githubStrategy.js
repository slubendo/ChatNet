/**
import { Strategy as GitHubStrategy } from "passport-github2";
import { getUserById } from "../../userController.js";
import { addNewUser, database, userModel } from "../../userModel.js";
import * as dotenv from "dotenv";
dotenv.config();
import process from "node:process";

const githubStrategy = new GitHubStrategy(
  {
    clientID: process.env.clientId || "",
    clientSecret: process.env.clientSecret || "",
    callbackURL: "http://localhost:8000/auth/github/callback",
    passReqToCallback: true,
  },
  async (req, accessToken, refreshToken, profile, done) => {
    // Check if the user with this GitHub ID already exists in the database
    const existingUser = getUserById(parseInt(profile.id));
    if (existingUser) {
      return done(null, existingUser);
    } else {
      // Create a new user with the GitHub profile.id, username
      const newUser = addNewUser({
        id: parseInt(profile.id),
        username: profile.username,
        email: "",
        password: "",
        role: "user",
      });
      return done(null, newUser);
    }
  }
);

export const passportGitHubStrategy = {
  name: "github",
  strategy: githubStrategy,
};

// export default passportGitHubStrategy;

 */
