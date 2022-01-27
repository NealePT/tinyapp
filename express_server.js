const express = require("express");
const app = express();
const PORT = 8080;

const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);

const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['5ca48a2d-11aa-4fa2-9bed-c318cb78495f', '059b4088-67ad-4057-91c0-73e7add5df73'],
  maxAge: 24 * 60 * 60 * 1000,
}));

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

// Listening to port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// URLs for default user
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userId: "AAaa11",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userId: "AAaa11",
  }
};

// Example user
const users = {
  "AAaa11": {
    id: "AAaa11",
    email: "masteraccount@neale.com",
    password: bcrypt.hashSync("master", salt)
  },
};

// Email checker function
const emailChecker = (email) => {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user].id;
    }
  }
  return false;
};

// URL checker function
const urlsForUser = (id) => {
  const urls = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userId === id) {
      urls[shortURL] = urlDatabase[shortURL];
    }
  }
  return urls;
};

app.get("/", (req, res) => {
  const templateVars = {
    urls: urlsForUser(req.session.user_id),
    user: users[req.session.user_id],
  };
  res.render("urls_index", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlsForUser(req.session.user_id),
    user: users[req.session.user_id],
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  };
  if (!req.session.user_id) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Edit URL
app.post("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id;
  const userURLs = urlsForUser[userId];
  if (Object.keys(userURLs).includes(req.params.shortURL)) {
    let shortURL = req.params.shortURL;
    let editedLongURL = req.body.newURL;
    if (!editedLongURL.includes('www.')) {
      editedLongURL = 'www.' + editedLongURL;
    }
    if (!editedLongURL.includes('://')) {
      editedLongURL = 'http://' + editedLongURL;
    }
    urlDatabase[shortURL].longURL = req.body.editedLongURL;
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.send(401);
  }
});

// Create new URL
app.post("/urls", (req, res) => {
  console.log(req.body.longURL);
  if (!req.session.user_id) {
    res.status(403).send("Please login before attempting to create a new TinyURL.");
  } else {
    let newShortURL = generateRandomString();
    let newLongURL = req.body.longURL;
    if (!newLongURL.includes('www.')) {
      newLongURL = 'www.' + newLongURL;
    }
    if (!newLongURL.includes('://')) {
      newLongURL = 'http://' + newLongURL;
    }
    urlDatabase[newShortURL] = {
      longURL: newLongURL,
      userId: req.session.user_id,
    };
    res.redirect(`/urls/${newShortURL}`);
  }

});

// Delete URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const userId = req.session.user_id;
  const userURLs = urlsForUser(userId);
  if (Object.keys(userURLs).includes(req.params.shortURL)) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.status(401);
  }
});

// Display urls_show page
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    urlsForId: urlDatabase[req.params.shortURL].userId,
    user: users[req.session.user_id],
  };
  res.render("urls_show", templateVars);
});

// Redirect to longURL page
app.get("/u/:shortURL", (req, res) => {
  if (!Object.keys(urlDatabase).includes(req.params.shortURL)) {
    res.status(404).send('TinyURL does not exist. Please check the URL and try again.');
  } else {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  }
});

// Send to registration page
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  };
  res.render("urls_registration", templateVars);
});

// Registration post
app.post("/register", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  if (!userEmail || !userPassword) {
    res.status(400).send('Please enter a valid email address and password. Neither value can be left blank.');
  }
  if (emailChecker(userEmail)) {
    res.status(400).send('Account already exists using this email address. Please login or use a different email to register.');
  }
  const newUserId = generateRandomString();
  users[newUserId] = {
    id: newUserId,
    email: userEmail,
    password: bcrypt.hashSync(userPassword, salt),
  };
  req.session.user_id = newUserId;
  console.log(users);
  res.redirect("/urls");
});

// Login post
app.post("/login", (req, res) => {
  const subEmail = req.body.email;
  const subPassword = req.body.password;
  if (!emailChecker(subEmail)) {
    res.status(403).send("This email address is not associated with an account. Please retype your email address or register as a new user.");
  } else {
    const userId = emailChecker(subEmail);
    if (!bcrypt.compareSync(subPassword, users[userId].password)) {
      res.status(403).send("The password you have entered is incorrect. Please try again.");
    } else {
      req.session.user_id = userId;
      res.redirect("/urls");
    }
  }
});

// Get to login page
app.get("/login", (req,res) => {
  const templateVars = {
    user: users[req.session.user_id],
  };
  res.render("urls_login", templateVars);
});

// Logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});



// Generate random 6 character string
const generateRandomString = () => {
  let result = "";
  let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

