const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  studentName: { type: String, required: true },
  seatNumber: { type: String, required: true },
  type: { type: String, enum: ['Check-In', 'Check-Out'], default: 'Check-In' },
  date: { type: String, required: true }, // DD MMM YYYY
  time: { type: String, required: true }, // HH:MM AM/PM
  studyHours: { type: Number, default: 0 }
}, { timestamps: true });

attendanceSchema.index({ studentId: 1, date: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
