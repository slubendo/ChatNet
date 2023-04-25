import passport from "passport";

export default class PassportConfig {
  constructor(strategies) {
    this.addStrategies(strategies);
  }

  addStrategies(strategies) {
    strategies.forEach((passportStrategy) => {
      passport.use(passportStrategy.name, passportStrategy.strategy);
    });
  }
}
