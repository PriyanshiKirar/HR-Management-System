const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  month: {
    type: Date,
    required: true
  },
  daysWorked: {
    type: Number,
    required: true
  },
  baseSalary: {
    type: Number,
    required: true
  },
  overtimePay: {
    type: Number,
    default: 0
  },
  taxAmount: {
    type: Number,
    required: true
  },
  netSalary: {
    type: Number,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Payroll', payrollSchema);
