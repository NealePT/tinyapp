const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
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

app.post("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let editedLongURL = req.body.newURL;
  // This breaks the edit button for some reason:
  // if (!editedLongURL.includes('www.')) {
  //   editedLongURL = 'www.' + editedLongURL;
  // }
  // if (!editedLongURL.includes('://')) {
  //   editedLongURL = 'http://' + editedLongURL;
  // }
  urlDatabase[shortURL] = editedLongURL;
  res.redirect(`/urls/${shortURL}`);
});

// Display urls_show page
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

// Redirect to longURL page
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
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

