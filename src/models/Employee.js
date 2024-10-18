const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: String,
  jobRole: String,
  salary: Number,
  hireDate: Date,
  documents: [{
    name: String,
    url: String
  }],
  attendance: [{
    date: { type: Date, required: true },
    checkIn: { type: String, required: true },
    checkOut: { type: String, required: true }
  }]
});

module.exports = mongoose.model('Employee', employeeSchema);
