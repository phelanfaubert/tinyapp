const express = require("express");
const app = express();
const cookieParser = require('cookie-parser')
const bodyParser = require("body-parser");

const PORT = 8080;

const users = { 
  "user1": {
    id: "plinketscrooge", 
    email: "plinket@scrooge.com", 
    password: "1111"
  },
 "user2": {
    id: "plunketadmiral", 
    email: "plunket@admiral.com", 
    password: "2222"
  }
}


app.use(bodyParser.urlencoded({extended: true})); 
app.use(cookieParser())

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies.user_id]
 };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id]
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies.user_id]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const shortURL = req.params.shortURL;       
  const longURL = req.body.longURL;       
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls");
  console.log(longURL)
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie("user_id", username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id]
  }
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const newID = generateRandomString();
  const user = {
    id: newID,
    email: req.body.email,
    password: req.body.password
  }
  createUser(users, req.body, res)
  users[newID] = user;
  res.cookie("user_id", newID);
  console.log(users)
  res.redirect("/urls");
});


function generateRandomString() {

  const result = Math.random().toString(20).substring(2, 8);
  return result;
};

const createUser = function(userDatabase, userInfo, res) {
  const { email, password } = userInfo;

  if (!email || !password) {
    console.log(userInfo)
    res.status(400).send('Missing email or password');
  }

  if (userDatabase[email]) {
    res.status(400).send('Bad Request');
  }

  const newUser = { email, password };
  userDatabase[email] = newUser;

  // return { error: null, data: newUser };
};