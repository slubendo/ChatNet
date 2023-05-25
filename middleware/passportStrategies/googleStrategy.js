// import { Strategy as GoogleStrategy } from "passport-google-oidc";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { userModel } from "../../prismaclient.js";
// import { addNewUser, database, userModel } from "../../userModel.js";
import * as dotenv from "dotenv";
dotenv.config();
import process from "node:process";

const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    callbackURL: process.env.GOOGLE_CB_URL || "",
    scope: ["profile", "email"],
    state: true,
  },
  async function (accessToken, refreshToken, profile, cb) {
    try {
      const email = profile.emails[0].value;
      let existingUser = await userModel.getUserByEmail(email);

      if (!existingUser) {
        // The Google account has not logged in to this app before. Create a new user record.
        const newUser = await userModel.addNewUser({
          username: profile.displayName,
          email: email,
          password: "",
        });
        existingUser = newUser;
      }
      return cb(null, existingUser);
    } catch (err) {
      return cb(err);
    }
  }
);

export const passportGoogleStrategy = {
  name: "google",
  strategy: googleStrategy,
};
