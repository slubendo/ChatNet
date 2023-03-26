const validateUsername = require("./validateUsername");

// return false
test("returns false for empty username", () => {
  expect(validateUsername("")).toBe(false);
});

test("returns false for username without numbers", () => {
  expect(validateUsername("edwarded")).toBe(false);
});

test("returns false for username without letters", () => {
  expect(validateUsername("123456")).toBe(false);
});

test("returns false for username with numbers, letters, length < 5", () => {
  expect(validateUsername("ed1")).toBe(false);
});

// return true
test("returns true for username with numbers, letters, length >= 5", () => {
  expect(validateUsername("edward1")).toBe(true);
  expect(validateUsername("EDWARD1")).toBe(true);
  expect(validateUsername("Edward1")).toBe(true);
});
