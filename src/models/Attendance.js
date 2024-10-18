const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  date: { type: Date, required: true },
  checkIn: Date,
  checkOut: Date,
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  },
  overtime: Number
});

attendanceSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Attendance', attendanceSchema);
