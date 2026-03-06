require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Seat = require('./models/Seat');

const mongoURI = process.env.MONGODB_URI; 

const init = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('✅ Connected');

    // 1. Create Admin
    const adminEmail = 'admin@studypoint.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('⚠️ Admin already exists, updating password...');
      const salt = await bcrypt.genSalt(10);
      existingAdmin.password = await bcrypt.hash('admin123', salt);
      await existingAdmin.save();
    } else {
      console.log('Creating Admin...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      const admin = new User({
        fullName: 'System Administrator',
        email: adminEmail,
        password: hashedPassword,
        role: 'Admin'
      });
      await admin.save();
    }
    console.log('✅ Admin: admin@studypoint.com / admin123');

    // 2. Initialize Seats
    const seatCount = await Seat.countDocuments();
    if (seatCount === 0) {
      console.log('Initializing 60 Seats...');
      const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
      const seats = [];
      for (const row of rows) {
        for (let i = 1; i <= 10; i++) {
          seats.push({ 
            seatNumber: `${row}${i}`, 
            floor: 'Ground', 
            section: 'Main', 
            seatType: 'Normal',
            isOccupied: false
          });
        }
      }
      await Seat.insertMany(seats);
      console.log('✅ Seats initialized');
    } else {
      console.log(`⚠️ ${seatCount} seats already exist.`);
    }

    console.log('\nDatabase Initialization Complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
};

init();
