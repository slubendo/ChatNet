export const getInitials = (fullName) => {
  const words = fullName.split(" ");
  let initials = "";
  for (let i = 0; i < Math.min(2, words.length); i++) {
    initials += words[i].charAt(0);
  }
  return initials.toUpperCase();
};
