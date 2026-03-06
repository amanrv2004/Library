const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Student = require('../models/Student');

// GET all payments
router.get('/', async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new payment
router.post('/', async (req, res) => {
  try {
    const paymentData = req.body;
    const payment = new Payment(paymentData);
    const newPayment = await payment.save();

    // Update Student's paidAmount and dueAmount
    const student = await Student.findById(paymentData.studentId);
    if (student) {
      student.paidAmount += paymentData.amount;
      student.dueAmount = Math.max(0, student.dueAmount - paymentData.amount);
      await student.save();
    }

    res.status(201).json(newPayment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET payments by student ID
router.get('/student/:studentId', async (req, res) => {
  try {
    const payments = await Payment.find({ studentId: req.params.studentId }).sort({ paymentDate: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
