const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  studentName: String,
  studyId: String,
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Resolved', 'In Progress'], default: 'Pending' },
  type: { type: String, enum: ['Complaint', 'Request'], default: 'Complaint' }
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);
