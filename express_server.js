const express = require("express");
const app = express();
const PORT = 8080;

const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);

const cookieSession = require('cookie-session');

const { emailChecker, urlsForUser, generateRandomString } = require("./helpers");

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

app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlsForUser(req.session.user_id, urlDatabase),
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
  const userURLs = urlsForUser(userId, urlDatabase);
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
    res.redirect("/urls");
  } else {
    res.status(401).send("You are not authorized to edit this URL.");
  }
});

// Delete URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const userId = req.session.user_id;
  const userURLs = urlsForUser(userId, urlDatabase);
  if (Object.keys(userURLs).includes(req.params.shortURL)) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.status(401).send("You are not authorized to delete this URL.");
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

// Display urls_show page
app.get("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      urlsForId: urlDatabase[req.params.shortURL].userId,
      user: users[req.session.user_id],
    };
    res.render("urls_show", templateVars);
  } else {
    res.status(404).send("TinyURL does not exist! Please check the URL to ensure you have the right address.");
  }
});

// Redirect to longURL page
app.get("/u/:shortURL", (req, res) => {
  if (!Object.keys(urlDatabase).includes(req.params.shortURL)) {
    res.status(404).send('TinyURL does not exist! Please check the URL and try again.');
  } else {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  }
});

// Send to registration page
app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      user: users[req.session.user_id],
    };
    res.render("urls_registration", templateVars);
  }

});

// Registration post
app.post("/register", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  if (!userEmail || !userPassword) {
    res.status(400).send('Please enter a valid email address and password. Neither value can be left blank.');
  }
  if (emailChecker(userEmail, users)) {
    res.status(400).send('Account already exists using this email address. Please login or use a different email to register.');
  }
  const newUserId = generateRandomString();
  users[newUserId] = {
    id: newUserId,
    email: userEmail,
    password: bcrypt.hashSync(userPassword, salt),
  };
  req.session["user_id"] = newUserId;
  res.redirect("/urls");
});

// Get to login page
app.get("/login", (req,res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      user: users[req.session.user_id],
    };
    res.render("urls_login", templateVars);
  }
});

// Login post
app.post("/login", (req, res) => {
  const subEmail = req.body.email;
  const subPassword = req.body.password;
  if (!emailChecker(subEmail, users)) {
    res.status(403).send("This email address is not associated with an account. Please retype your email address or register as a new user.");
  } else {
    const userId = emailChecker(subEmail, users);
    if (!bcrypt.compareSync(subPassword, users[userId].password)) {
      res.status(403).send("The password you have entered is incorrect. Please try again.");
    } else {
      req.session["user_id"] = userId;
      res.redirect("/urls");
    }
  }
});

// Logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});