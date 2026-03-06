const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer for File Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads/';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// GET all students
router.get('/', async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET specific student
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    res.json(student);
  } catch (err) {
    res.status(404).json({ message: 'Student not found' });
  }
});

// POST new student with uploads
router.post('/', upload.fields([
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'idProof', maxCount: 1 }
]), async (req, res) => {
  try {
    const studentData = req.body;
    
    // Hash Password
    const salt = await bcrypt.genSalt(10);
    studentData.password = await bcrypt.hash(studentData.password || '123456', salt);
    
    // Assign file paths if uploaded
    if (req.files) {
      if (req.files.profilePhoto) studentData.profilePhoto = req.files.profilePhoto[0].path;
      if (req.files.idProof) studentData.idProof = req.files.idProof[0].path;
    }

    const student = new Student(studentData);
    const newStudent = await student.save();
    res.status(201).json(newStudent);
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ message: 'STUDY_ID_CONFLICT: This Study ID or Email is already registered.' });
    } else {
      res.status(400).json({ message: err.message });
    }
  }
});

// PATCH update student
router.patch('/:id', upload.fields([
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'idProof', maxCount: 1 }
]), async (req, res) => {
  try {
    const updateData = req.body;
    
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    if (req.files) {
      if (req.files.profilePhoto) updateData.profilePhoto = req.files.profilePhoto[0].path;
      if (req.files.idProof) updateData.idProof = req.files.idProof[0].path;
    }

    const updatedStudent = await Student.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updatedStudent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE student
router.delete('/:id', async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: 'Student deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
