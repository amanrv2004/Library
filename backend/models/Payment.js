const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  studentName: String,
  amount: { type: Number, required: true },
  paymentDate: { type: Date, default: Date.now },
  method: { type: String, enum: ['Cash', 'UPI', 'Bank Transfer', 'Other'], default: 'Cash' },
  transactionId: String,
  status: { type: String, enum: ['Paid', 'Partial', 'Pending'], default: 'Paid' },
  month: String // e.g., 'March 2026'
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
