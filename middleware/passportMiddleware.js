// import { Application } from "express";
import passport from "passport";
import PassportConfig from "./PassportConfig.js";

import { passportLocalStrategy } from "./passportStrategies/localStrategy.js";

// No need to actually pass the instance of passport since it returns a singleton
const passportConfig = new PassportConfig([
  passportLocalStrategy,
  // passportGitHubStrategy,
]);

export const passportMiddleware = (app) => {
  app.use(passport.initialize());
  app.use(passport.session());
};
