const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');

// Apply isAuthenticated middleware to the home route
router.get('/', isAuthenticated, (req, res) => {
  res.render('home');
});

module.exports = router;
