function isAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
    return res.redirect('/dashboard'); // Redirect to dashboard or home page
  }
  next();
}

function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  res.redirect('/auth/login');
}

module.exports = { isAuthenticated, requireAuth };
