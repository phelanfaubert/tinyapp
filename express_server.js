const express = require("express");
const app = express();
const cookieParser = require('cookie-parser')
const bodyParser = require("body-parser");

const PORT = 8080;

const users = { 
  "plinketscrooge": {
    id: "plinketscrooge", 
    email: "plinket@scrooge.com", 
    password: "1111"
  },
 "plunketadmiral": {
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
  console.log('REQ cookies', req.cookies)
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
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.cookies.user_id]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const userId = req.cookies.user_id;
  if(userId && users[userId]) {
  const shortURL = generateRandomString();
  urlDatabase[shortURL].longURL = req.body.longURL
  res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(400).send("Acces denied")
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL].longURL;
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const shortURL = req.params.shortURL;       
  const longURL = req.body.longURL;       
  urlDatabase[shortURL].longURL = longURL;
  res.redirect("/urls");
  console.log(longURL)
});

app.post("/login", (req, res) => {
  checkUser(users, req.body, res, req)
  createUser(users, req.body, res)
  // checkEmail(users,req.body, res)
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

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id]
  }
  res.render("urls_login", templateVars)
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
console.log("UDBEMAIL", userDatabase[email])
  if (userDatabase[email]) {
    
    res.status(400).send('Invalid');
  }

  const newUser = { email, password };
  userDatabase[email] = newUser;
};

const checkUser = function(userDatabase, userInfo, res, req) {
  const { email, password } = userInfo;
// console.log('Look for email', email)
// console.log('Look for pass', password)
  if (!email || !password) {
    // console.log(userInfo)
    res.status(400).send('Missing email or password');
  }
for (const key in userDatabase) {
  // console.log(userDatabase[key])
  if (userDatabase[key].email === email && userDatabase[key].password === password) {
    res.cookie("user_id", userDatabase[key].id)
    res.redirect("/urls");
  }
}
};

// const checkEmail = function(userDatabase, userInfo, res) {
//   const { email, password } = userInfo;
//   if(!email) {
//     res.status(403).send('Email not found')
//   }
// for (const key in userDatabase) {
//   if(userDatabase[key].email === email && userDatabase[key].password !== password) {
//     res.status(403).send('Email and password do not match')
//   } else {
//     res.cookie("user_id", userDatabase[key].id)
//     res.redirect("/urls");
//   }
// }
// };

