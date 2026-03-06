const express = require('express');
const router = express.Router();
const Seat = require('../models/Seat');

// GET all seats
router.get('/', async (req, res) => {
  try {
    const seats = await Seat.find().populate('studentId', 'fullName studyId');
    res.json(seats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new seat
router.post('/', async (req, res) => {
  try {
    const seat = new Seat(req.body);
    const newSeat = await seat.save();
    res.status(201).json(newSeat);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH update seat
router.patch('/:id', async (req, res) => {
  try {
    const updatedSeat = await Seat.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedSeat);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE seat
router.delete('/:id', async (req, res) => {
  try {
    await Seat.findByIdAndDelete(req.params.id);
    res.json({ message: 'Seat deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Initialize Seats (Setup)
router.post('/initialize', async (req, res) => {
  try {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
    const seats = [];
    for (const row of rows) {
      for (let i = 1; i <= 10; i++) {
        seats.push({ seatNumber: `${row}${i}`, floor: 'Ground', section: 'Main', seatType: 'Normal' });
      }
    }
    await Seat.insertMany(seats);
    res.status(201).json({ message: 'Seats initialized' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
