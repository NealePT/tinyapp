const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
};

const emailChecker = (email) => {
  for (const user in users) {
    if (users[user].email === email) {
      return true;
    }
  }
  return false;
};

app.get("/", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_index", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Edit URL
app.post("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let editedLongURL = req.body.newURL;
  if (!editedLongURL.includes('www.')) {
    editedLongURL = 'www.' + editedLongURL;
  }
  if (!editedLongURL.includes('://')) {
    editedLongURL = 'http://' + editedLongURL;
  }
  urlDatabase[shortURL] = editedLongURL;
  res.redirect(`/urls/${shortURL}`);
});

// Create new URL
app.post("/urls", (req, res) => {
  console.log(req.body.longURL);
  let newShortURL = generateRandomString();
  let newLongURL = req.body.longURL;
  if (!newLongURL.includes('www.')) {
    newLongURL = 'www.' + newLongURL;
  }
  if (!newLongURL.includes('://')) {
    newLongURL = 'http://' + newLongURL;
  }
  urlDatabase[newShortURL] = newLongURL;
  res.redirect(`/urls/${newShortURL}`);
});

// Delete URL
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

// Display urls_show page
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_show", templateVars);
});

// Redirect to longURL page
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// Send to registration page
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_registration", templateVars);
});

// Registration post
app.post("/register", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  if (!userEmail || !userPassword) {
    res.status(400).send('Please enter a valid email address and password. Neither can be left blank.');
  }
  if (emailChecker(userEmail)) {
    res.status(400).send('Account already exists using this email address. Please login or use a different email to register.');
  }
  const newUserId = generateRandomString();
  users[newUserId] = {
    id: newUserId,
    email: userEmail,
    password: userPassword,
  };
  res.cookie("user_id", newUserId);
  console.log(users);
  res.redirect("/urls");
});

// Login
app.post("/login", (req, res) => {
  let username = req.body.username;
  res.cookie('username', username);
  console.log(`New User: ${username}`);
  res.redirect("/urls");
});

// Get to login page
app.get("/login", (req,res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_login", templateVars);
});

// Logout
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

// Listening to port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
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

