const express = require("express");
const app = express();
const cookieParser = require('cookie-parser')
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');

const PORT = 8080;

app.use(bodyParser.urlencoded({extended: true})); 
app.use(cookieParser())
app.set("view engine", "ejs");

const users = { 
  "plinketscrooge": {
    id: "plinketscrooge", 
    email: "plinket@scrooge.com", 
    password: "1111"
  },
 "plunketadmirals": {
    id: "plunketadmirals", 
    email: "plunket@admirals.com", 
    password: "2222"
  }
}

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
console.log("req params", req.params)

if (users[req.cookies.user_id]) {

  const tempObj = {}
  for (let key in urlDatabase) {
    const url = urlDatabase[key];
    if (users[req.cookies.user_id].id === url.userID) {
      tempObj[key] = urlDatabase[key]
    }
  }
  // console.log(tempObj)
  // console.log(users[req.cookies.user_id].id)
      const templateVars = {
        user: users[req.cookies.user_id].email,
        urls: tempObj
      }
      res.render("urls_index", templateVars);
      return;
    }

    res.render("urls_login", { user: null })
});

// 

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
  // const password = req.params.password
  // const hashedPassword = bcrypt.hashSync(password, 10);
  // bcrypt.compareSync(password, hashedPassword);
  checkUser(users, req.body, res, req)
  createUser(users, req.body, res)

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

app.get("/u/:shortURL", (req, res) => {
  const short = req.params.shortURL; //b2xVn2
  const long = urlDatabase[short].longURL // lighthouselabs.com
  res.redirect(long) 
});

app.post("/register", (req, res) => {
  const password = req.params.password; 
  const hashedPassword = bcrypt.hashSync(password, 10);
  const newID = generateRandomString();
  const user = {
    id: newID,
    email: req.body.email,
    password: req.body.password
  }
  createUser(users, req.body, res)
  users[newID] = user;
  res.cookie("user_id", newID);
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

const createUser = function(users, userInfo, res) {
  const { email, password } = userInfo;

  if (!email || !password) {
    console.log(userInfo)
    res.status(400).send('Missing email or password');
  }
console.log("UDBEMAIL", users[email])
  if (users[email]) {
    
    res.status(400).send('Invalid');
  }

  const newUser = { email, password };
  users[email] = newUser;
};

const checkUser = function(users, userInfo, res, req) {
  const { email, password } = userInfo;
// console.log('Look for email', email)
// console.log('Look for pass', password)
  if (!email || !password) {
    // console.log(userInfo)
    res.status(400).send('Missing email or password');
  }
for (const key in users) {
  // console.log(userDatabase[key])
  if (users[key].email === email && users[key].password === password) {
    res.cookie("user_id", users[key].id)
    res.redirect("/urls");
  }
}
};