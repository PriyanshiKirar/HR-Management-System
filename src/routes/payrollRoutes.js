const express = require('express');
const router = express.Router();
const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const PDFDocument = require('pdfkit');

// Get all payroll records
router.get('/', async (req, res) => {
  try {
    const payrollRecords = await Payroll.find().populate('employee');
    res.render('payroll/index', { payrollRecords });
  } catch (error) {
    console.error('Error fetching payroll records:', error);
    req.flash('error', 'Error fetching payroll records');
    res.redirect('/');
  }
});

// Display generate payroll form
router.get('/generate', async (req, res) => {
  try {
    const employees = await Employee.find();
    res.render('payroll/generate', { employees });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Generate payroll
router.post('/', async (req, res) => {
  const payroll = new Payroll({
    employee: req.body.employeeId,
    period: {
      start: req.body.periodStart,
      end: req.body.periodEnd
    },
    baseSalary: req.body.baseSalary,
    overtime: req.body.overtime,
    deductions: req.body.deductions,
    taxAmount: req.body.taxAmount,
    netSalary: req.body.netSalary,
    status: req.body.status
  });

  try {
    const newPayroll = await payroll.save();
    res.redirect('/payroll');
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add more routes for updating and deleting payroll records

// Add this route for salary calculation
router.get('/calculate', async (req, res) => {
  try {
    const employees = await Employee.find();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    for (const employee of employees) {
      const attendanceRecords = await Attendance.find({
        employee: employee._id,
        date: { $gte: startOfMonth, $lte: endOfMonth }
      });

      const daysWorked = attendanceRecords.length;
      const dailyRate = employee.salary / 22; // Assuming 22 working days per month
      const baseSalary = dailyRate * daysWorked;

      const overtimeHours = attendanceRecords.reduce((total, record) => 
        total + (record.hoursWorked > 8 ? record.hoursWorked - 8 : 0), 0);
      const overtimePay = overtimeHours * (dailyRate / 8) * 1.5;

      const taxRate = 0.2; // 20% tax rate
      const taxAmount = (baseSalary + overtimePay) * taxRate;
      const netSalary = baseSalary + overtimePay - taxAmount;

      await Payroll.findOneAndUpdate(
        { employee: employee._id, month: startOfMonth },
        {
          employee: employee._id,
          month: startOfMonth,
          daysWorked,
          baseSalary,
          overtimePay,
          taxAmount,
          netSalary
        },
        { upsert: true, new: true, runValidators: true }
      );
    }

    req.flash('success', 'Salaries calculated successfully');
    res.redirect('/payroll');
  } catch (error) {
    console.error('Error calculating salaries:', error);
    req.flash('error', 'Error calculating salaries');
    res.redirect('/payroll');
  }
});

router.get('/payslips', async (req, res) => {
  try {
    // Fetch all payroll records for the current month
    const currentDate = new Date();
    const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const payrollRecords = await Payroll.find({ month: currentMonth }).populate('employee');

    // Generate payslips
    const doc = new PDFDocument();
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      let pdfData = Buffer.concat(buffers);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=payslips.pdf');
      res.send(pdfData);
    });

    payrollRecords.forEach((record, index) => {
      if (index === 0) {
        doc.fontSize(20).text(`Payroll for ${currentMonth.toLocaleString('default', { month: 'long' })}`, 100, 100);
      }

      doc.fontSize(14).text(`Employee: ${record.employee.name}`, 100, 150 + (index * 20));
      doc.fontSize(14).text(`Days Worked: ${record.daysWorked}`, 100, 170 + (index * 20));
      doc.fontSize(14).text(`Base Salary: ${record.baseSalary}`, 100, 190 + (index * 20));
      doc.fontSize(14).text(`Overtime Pay: ${record.overtimePay}`, 100, 210 + (index * 20));
      doc.fontSize(14).text(`Tax Amount: ${record.taxAmount}`, 100, 230 + (index * 20));
      doc.fontSize(14).text(`Net Salary: ${record.netSalary}`, 100, 250 + (index * 20));
    });

    doc.end();
  } catch (error) {
    console.error('Error generating payslips:', error);
    req.flash('error', 'Error generating payslips');
    res.redirect('/payroll');
  }
});

// path/to/your/server/file.js
// ... existing routes ...

router.get('/payslip/:recordId', async (req, res) => {
    const recordId = req.params.recordId;
    // Logic to fetch the record and generate the PDF


    const doc = new PDFDocument();
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      let pdfData = Buffer.concat(buffers);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=payslip-${recordId}.pdf`);
      res.send(pdfData);
    });


    const record = await Payroll.findById(recordId).populate('employee')

    // doc.fontSize(20).text(`Payroll for ${record.month.toLocaleString('default', { month: 'long' })}`, 100, 100);
    doc.fontSize(14).text(`Employee: ${record.employee.name}`, 100, 150);
    doc.fontSize(14).text(`Days Worked: ${record.daysWorked}`, 100, 170);
    doc.fontSize(14).text(`Base Salary: ${record.baseSalary}`, 100, 190);
    doc.fontSize(14).text(`Overtime Pay: ${record.overtimePay}`, 100, 210);
    doc.fontSize(14).text(`Tax Amount: ${record.taxAmount}`, 100, 230);
    doc.fontSize(14).text(`Net Salary: ${record.netSalary}`, 100, 250);

    doc.end();
    
    // For example, using a library like pdfkit or similar
    // ...

    // Send the generated PDF as a response
    res.setHeader('Content-Type', 'application/pdf');
     
    // Assuming pdfBuffer contains the generated PDF
});

// ... existing routes ...

module.exports = router;
