/**
 * For registration purpose
 * The newly created username must
 *      1) contain at least one number
 *      2) contain letters
 *      3) with a minimum length of five
 **/

const validateUsername = (usernameInput) => {
  const validLength = usernameInput.length >= 5;
  const containsNumber = /[0-9]/g.test(usernameInput);
  const containsLetter = /[a-zA-Z]/g.test(usernameInput);
  return validLength && containsNumber && containsLetter;
};

module.exports = validateUsername;
