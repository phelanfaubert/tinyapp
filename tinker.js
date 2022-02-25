// LOADS MAIN URL DISPLAY PAGE
app.get("/urls", (req, res) => {
  const loggedInUser = req.cookies["user_id"];

  // for filtering which URLs are visible based on which user is logged in
  const filteredURLs = {};
  for (let key in urlDatabase) {
    const url = urlDatabase[key];
    if (loggedInUser === url.userID) {
      filteredURLs[key] = url;
    }
  }
  // passing variables to the header partial and error page
  const templateVars = {
    urls: filteredURLs,
    "user_id": loggedInUser,
    msg: "You must log in to view this page."
  };

  // if no one is logged in when requesting this page, redirect to error page.
  if (!loggedInUser) {
    res.render("error", templateVars);
    return;
  }

  res.render("urls_index", templateVars);
});



if (!(users[req.cookies.user_id])) {
  res.render("urls_login", { user: null });
}