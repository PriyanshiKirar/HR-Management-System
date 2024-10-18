const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');

// Get all employees
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find();
    res.render('employees/index', { employees });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Display create employee form
router.get('/create', (req, res) => {
  res.render('employees/create');
});

// Create a new employee
router.post('/', async (req, res) => {
  const employee = new Employee({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    jobRole: req.body.jobRole,
    salary: req.body.salary,
    hireDate: req.body.hireDate
  });

  // Add attendance handling
  if (req.body.checkIn && req.body.checkOut) {
    const today = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
    employee.attendance = [{
      date: new Date(today),
      checkIn: req.body.checkIn,
      checkOut: req.body.checkOut
    }];
  }

  try {
    const newEmployee = await employee.save();
    res.redirect('/employees');
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get a single employee
router.get('/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (employee == null) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.render('employees/view', { employee });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Display edit employee form
router.get('/:id/edit', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (employee == null) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.render('employees/edit', { employee });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update an employee
router.patch('/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (employee == null) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Update employee fields
    const fields = ['name', 'email', 'phone', 'jobRole', 'salary', 'hireDate'];
    fields.forEach(field => {
      if (req.body[field] != null) {
        employee[field] = req.body[field];
      }
    });

    // Handle attendance update
    if (req.body.checkIn && req.body.checkOut) {
      const today = new Date().toISOString().split('T')[0];
      const newAttendance = {
        date: new Date(today),
        checkIn: req.body.checkIn,
        checkOut: req.body.checkOut
      };

      // Check if attendance for today already exists
      const todayAttendanceIndex = employee.attendance.findIndex(a => 
        a.date.toISOString().split('T')[0] === today
      );

      if (todayAttendanceIndex !== -1) {
        // Update existing attendance
        employee.attendance[todayAttendanceIndex] = newAttendance;
      } else {
        // Add new attendance
        employee.attendance.push(newAttendance);
      }
    }

    const updatedEmployee = await employee.save();
    res.redirect('/employees');
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete an employee
router.delete('/:id', async (req, res) => {
  try {
    const result = await Employee.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).send('Employee not found');
    }
    res.redirect('/employees');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

module.exports = router;
