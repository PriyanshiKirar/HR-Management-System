const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Login route
router.get('/login', (req, res) => {
  res.render('auth/login', { error: req.flash('error'), errors: [] });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && await bcrypt.compare(password, user.password)) {
      req.session.userId = user._id;
      // Instead of redirecting, render the home page directly
      res.render('home', { user: user });
    } else {
      req.flash('error', 'Invalid email or password');
      res.render('auth/login', { error: req.flash('error'), errors: [] });
    }
  } catch (error) {
    console.error(error);
    req.flash('error', 'An error occurred during login');
    res.render('auth/login', { error: req.flash('error'), errors: [] });
  }
});

// Register route
router.get('/register', (req, res) => {
  res.render('auth/register', { error: req.flash('error'), errors: [] });
});

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash('error', 'Email already in use');
      return res.render('auth/register', { error: req.flash('error'), errors: [] });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    req.flash('success', 'Registration successful. Please log in.');
    res.redirect('/auth/login');
  } catch (error) {
    console.error(error);
    req.flash('error', 'An error occurred during registration');
    res.render('auth/register', { error: req.flash('error'), errors: [] });
  }
});

// Logout route
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) console.log(err);
    res.redirect('/auth/login');
  });
});

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

// Upload documents route
router.get('/upload-documents', (req, res) => {
  res.render('auth/upload-documents', { error: req.flash('error'), success: req.flash('success') });
});

router.post('/upload-documents', upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'certificate', maxCount: 1 }
]), (req, res) => {
  if (req.files['resume'] && req.files['certificate']) {
    req.flash('success', 'Documents uploaded successfully');
    console.log('Resume:', req.files['resume'][0].path);
    console.log('Certificate:', req.files['certificate'][0].path);
  } else {
    req.flash('error', 'Please upload both resume and certificate');
  }
  res.redirect('/auth/upload-documents');
});

module.exports = router;
