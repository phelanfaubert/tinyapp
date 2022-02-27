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

module.exports = { findUserByEmail, generateRandomString }