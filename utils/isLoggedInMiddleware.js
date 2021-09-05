isLoggedIn = (req, res, next) => {
  if (!req.user) {
    throw new Error('Login to perform the action');
  }
  next()
};
module.exports = isLoggedIn;
