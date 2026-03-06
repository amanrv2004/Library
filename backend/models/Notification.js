const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  recipient: { type: String, default: 'All' }, // 'All' or specific StudentId
  type: { type: String, enum: ['Fee Reminder', 'Holiday', 'Maintenance', 'General'], default: 'General' },
  isRead: { type: Boolean, default: false },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
