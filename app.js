const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const employeeRoutes = require('./src/routes/employeeRoutes');
const attendanceRoutes = require('./src/routes/attendanceRoutes');
const payrollRoutes = require('./src/routes/payrollRoutes');
const connectDB = require('./src/config/database');
const session = require('express-session');
const homeRoutes = require('./src/routes/homeRoutes');
const authRoutes = require('./src/routes/authRoutes');
const flash = require('connect-flash');
const { requireAuth } = require('./src/middleware/authMiddleware');

const app = express();

// Connect to MongoDB
connectDB();

// Set the views directory
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));
app.use(flash());

// Auth routes (unprotected)
app.use('/auth', authRoutes);

// Home route (protected)
app.use('/', homeRoutes);

// Attendance routes (protected)
app.use('/attendance', attendanceRoutes);

// Redirect to login if accessing the root without authentication
app.get('/', (req, res) => {
  res.redirect('/auth/login');
});

// Routes
app.use('/employees', employeeRoutes);
app.use('/payroll', payrollRoutes);

// Test route
app.get('/test', (req, res) => {
  res.send('Test route is working');
});

// Dashboard route
app.get('/dashboard', requireAuth, (req, res) => {
  res.render('dashboard');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
