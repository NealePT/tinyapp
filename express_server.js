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

app.get("/", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"],
  };
  res.render("urls_index", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"],
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
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
    username: req.cookies["username"],
  };
  res.render("urls_show", templateVars);
});

// Redirect to longURL page
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// Login
app.post("/login", (req, res) => {
  let username = req.body.username;
  res.cookie('username', username);
  console.log(`New User: ${username}`);
  res.redirect("/urls");
});

// Logout
app.post("/logout", (req, res) => {
  res.clearCookie('username');
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

