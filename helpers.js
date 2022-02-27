const { users, urlDatabase } = require('./database.js');

function generateRandomString() {
  const result = Math.random().toString(20).substring(2, 8);
  return result;
};

const findUserByEmail = function(email, database) {
  for (let user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return null;
}

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

module.exports = { findUserByEmail, generateRandomString, urlsForUser }