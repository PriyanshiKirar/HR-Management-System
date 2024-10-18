const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const { isAuthenticated } = require('../middleware/auth');

// Apply isAuthenticated middleware to all routes
router.use(isAuthenticated);

// Get all attendance records
router.get('/', async (req, res) => {
  try {
    const attendanceRecords = await Attendance.find().populate('employee');
    res.render('attendance/index', { attendanceRecords });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Display record attendance form
router.get('/record', async (req, res) => {
  try {
    const employees = await Employee.find();
    res.render('attendance/record', { employees });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Record attendance
router.post('/', async (req, res) => {

  const checkInDate = new Date(`${req.body.date}T${req.body.checkIn}`);
    const checkOutDate = new Date(`${req.body.date}T${req.body.checkOut}`);

    
  
  
  const attendance = new Attendance({
    employee: req.body.employeeId,
    date: req.body.date,
    checkIn: checkInDate,
    checkOut: checkOutDate,
    location: {
      type: 'Point',
      coordinates: [req.body.longitude, req.body.latitude]
    },
    overtime: req.body.overtime
  });

  try {
    const newAttendance = await attendance.save();
    res.redirect('/attendance');
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add more routes for updating and deleting attendance records

module.exports = router;
