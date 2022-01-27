// Email checker function
const emailChecker = (email, database) => {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user].id;
    }
  }
  // return false;
};

// URL checker function
const urlsForUser = (id, database) => {
  const urls = {};
  for (const shortURL in database) {
    if (database[shortURL].userId === id) {
      urls[shortURL] = database[shortURL];
    }
  }
  return urls;
};

// Generate random 6 character string
const generateRandomString = () => {
  let result = "";
  let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};


module.exports = {
  emailChecker,
  urlsForUser,
  generateRandomString,
};