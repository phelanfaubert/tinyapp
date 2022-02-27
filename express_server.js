const express = require("express");
const app = express();
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
const { findUserByEmail, generateRandomString } = require('./helpers.js');
const PORT = 8080;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: "session",
  keys: ['Iwonderwhatmyfirstbornwillbelike', 'CanIgetcurlyfrieswiththat']
}));

const users = {
  "plinketscrooge": {
    id: "plinketscrooge",
    email: "plinket@scrooge.com",
    password: bcrypt.hashSync("1111", 10)
  },
  "plunketadmirals": {
    id: "plunketadmirals",
    email: "plunket@admirals.com",
    password: bcrypt.hashSync("2222", 10)
  }
};

const urlDatabase = {
  'b2xVn2': {
    longURL: "http://www.lighthouselabs.ca",
    userID: "plinketscrooge"
  },
  '9sm5xK': {
    longURL: "https://www.google.com",
    userID: "plunketadmirals"
  }
};

const urlsForUser = function(userId) {
  const tempObj = {};
  for (let key in urlDatabase) {
    const url = urlDatabase[key];
    if (users[userId].id === url.userID) {
      tempObj[key] = urlDatabase[key];
    }
  }
  return tempObj;
};

app.get("/", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  if (req.session.user_id) {
    res.redirect("/urls");
  }
  res.render("urls_login", templateVars);
  // res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  if (users[req.session.user_id]) {
    const urls = urlsForUser(req.session.user_id);
    const templateVars = {
      user: users[req.session.user_id].email,
      urls: urls
    };
    res.render("urls_index", templateVars);
    return;
  }

  // res.render("urls_login", { user: null });
  res.status(400).send('Must be logged in to access this page');
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  if (req.session.user_id) {
    res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const userId = req.session.user_id;
  if (!userId || !users[userId]) {
    return res.send("<div>Please log in</div>");
  }
  const urls = urlsForUser(req.session.user_id);
  const shortURL = req.params.id;
  if (!urls[shortURL]) {
    return res.send("<div>Acces denied</div>");
  }
  const longURL = urlDatabase[shortURL].longURL;
  const templateVars = {
    user: users[req.session.user_id].email,
    shortURL: shortURL,
    longURL: longURL
  };
  res.render("urls_show", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session.user_id]
  };
  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  if (req.session.user_id) {
    res.redirect("/urls")
  }
  res.render("urls_register", templateVars);
});

app.get("/u/:id", (req, res) => {
  const short = req.params.id; //b2x  Vn2
  const long = urlDatabase[short].longURL; // lighthouselabs.com
  res.redirect(long);
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  if (req.session.user_id) {
    res.redirect("/urls");
  }
  res.render("urls_login", templateVars);
});

app.post("/urls", (req, res) => {
  const userId = req.session.user_id;
  if (userId && users[userId]) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: userId
    };
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(400).send("Acces denied");
  }
});

app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[shortURL].longURL = longURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const password = req.body.password;
  const email = req.body.email;
  if (!email || !password) {
    res.status(400).send('Missing Email Or Password');
    return;
  }
  const user = findUserByEmail(email, users);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    res.status(400).send('Email/Password Do Not Exist');
    return;
  }

  req.session.user_id = user.id;
  res.redirect("/urls");
  return;
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send('Cannot Leave Fields Blank');
  }

  if (findUserByEmail(email, users)) {
    return res.status(400).send('Email Already Exists');
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const newID = generateRandomString();
  const user = {
    id: newID,
    email: req.body.email,
    password: hashedPassword
  };
  users[newID] = user;
  req.session.user_id = newID;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});