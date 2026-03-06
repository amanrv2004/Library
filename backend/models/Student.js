const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  studyId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  alternatePhone: String,
  address: String,
  idProof: String, // Path to ID proof file
  profilePhoto: String, // Path to profile photo file
  seat: { type: String, default: 'Unassigned' },
  joiningDate: { type: Date, default: Date.now },
  course: String, // Course or exam preparation
  monthlyFee: { type: Number, required: true },
  securityDeposit: { type: Number, default: 0 },
  paidAmount: { type: Number, default: 0 },
  dueAmount: { type: Number, default: 0 },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  lastCheckIn: { type: String, default: '--' },
  attendancePercentage: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
