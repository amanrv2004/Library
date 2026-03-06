const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true, enum: ['Rent', 'Electricity', 'Internet', 'Furniture', 'Maintenance', 'Salaries', 'Other'] },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  description: String
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
