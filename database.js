const bcrypt = require('bcryptjs');

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
}


module.exports = { users, urlDatabase }