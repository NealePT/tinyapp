// Email checker function
const emailChecker = (email, database) => {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user].id;
    }
  }
  return false;
};

module.exports = {
  emailChecker,
};