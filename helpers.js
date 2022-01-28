// Email checker function
const emailChecker = (email, database) => {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user].id;
    }
  }
};

// URL checker function
const urlsForUser = (id, urlDatabase) => {
  const urls = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userId === id) {
      urls[shortURL] = urlDatabase[shortURL];
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