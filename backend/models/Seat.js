const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  seatNumber: { type: String, required: true, unique: true },
  floor: { type: String, default: 'Ground' },
  section: { type: String, default: 'Main' },
  seatType: { type: String, enum: ['Normal', 'Premium', 'AC'], default: 'Normal' },
  isOccupied: { type: Boolean, default: false },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', default: null }
}, { timestamps: true });

module.exports = mongoose.model('Seat', seatSchema);
