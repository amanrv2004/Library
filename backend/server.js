require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 5005;

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS Configuration
const allowedOrigins = [
  process.env.ADMIN_URL,
  process.env.STUDENT_URL,
  process.env.FRONTEND_URL,
  process.env.STUDENT_PORTAL_URL,
  'http://localhost:5173',
  'http://localhost:5174'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Active', 
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected' 
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'Study Point Management System API is Online', status: 'Active' });
});

// Models
const User = require('./models/User');
const Student = require('./models/Student');
const Attendance = require('./models/Attendance');
const Expense = require('./models/Expense');
const Notification = require('./models/Notification');
const Seat = require('./models/Seat');
const Payment = require('./models/Payment');

// Routes
const studentRouter = require('./routes/students');
const expenseRouter = require('./routes/expenses');
const authRouter = require('./routes/auth');
const seatRouter = require('./routes/seats');
const paymentRouter = require('./routes/payments');
const complaintRouter = require('./routes/complaints');
const notificationRouter = require('./routes/notifications');

app.use('/api/students', studentRouter);
app.use('/api/expenses', expenseRouter);
app.use('/api/auth', authRouter);
app.use('/api/seats', seatRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/complaints', complaintRouter);
app.use('/api/notifications', notificationRouter);

// Explicit Admin Info Route
app.get('/api/auth/admin-info', async (req, res) => {
  try {
    const User = require('./models/User');
    const admin = await User.findOne({ role: 'Admin' }, 'fullName email');
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    res.json(admin);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Explicit Complaints POST Route
app.post('/api/complaints', async (req, res) => {
  try {
    const Complaint = require('./models/Complaint');
    const complaint = new Complaint(req.body);
    await complaint.save();
    res.status(201).json(complaint);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Explicit Student Payments Route
app.get('/api/payments/student/:studentId', async (req, res) => {
  try {
    const Payment = require('./models/Payment');
    const payments = await Payment.find({ studentId: req.params.studentId }).sort({ paymentDate: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete('/api/complaints/:id', async (req, res) => {
  try {
    const Complaint = require('./models/Complaint');
    await Complaint.findByIdAndDelete(req.params.id);
    res.json({ message: 'Complaint deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Attendance Endpoints
app.get('/api/attendance', async (req, res) => {
  try {
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
    const logs = await Attendance.find({ date: today }).sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    console.error('Attendance Fetch Error:', err);
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/attendance/sync', async (req, res) => {
  try {
    const { studentId, type } = req.body;
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const now = new Date();
    const todayStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
    const typeLabel = type === 'In' ? 'Check-In' : 'Check-Out';
    
    // Use findOneAndUpdate with upsert for atomic "get or create"
    const log = await Attendance.findOneAndUpdate(
      { 
        studentId, 
        date: todayStr, 
        type: typeLabel 
      },
      {
        $setOnInsert: {
          studentName: student.fullName,
          seatNumber: student.seat,
          studentId,
          type: typeLabel,
          date: todayStr,
          time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Calculate new attendance percentage (Rolling 30-day window)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const distinctDaysRecent = await Attendance.distinct('date', { 
      studentId: student._id,
      createdAt: { $gte: thirtyDaysAgo }
    });

    const startDate = student.joiningDate || student.createdAt || now;
    const daysSinceJoining = Math.max(1, Math.ceil((now - new Date(startDate)) / (1000 * 60 * 60 * 24)));
    const calculationWindow = Math.min(30, daysSinceJoining);
    
    const attendancePercentage = Math.min(100, Math.round((distinctDaysRecent.length / calculationWindow) * 100));

    await Student.findByIdAndUpdate(studentId, { 
      lastCheckIn: `${log.date}, ${log.time}`,
      attendancePercentage 
    });
    
    res.status(201).json(log);
  } catch (err) {
    console.error('Attendance Sync Error:', err);
    res.status(400).json({ message: err.message });
  }
});

// Stats Endpoint
app.get('/api/stats', async (req, res) => {
  try {
    const [activeStudents, allSeats, allPayments] = await Promise.all([
      Student.find({ status: 'Active' }),
      Seat.find({}, 'seatNumber'),
      Payment.find({}, 'amount')
    ]);

    const totalStudents = activeStudents.length;
    const totalSeats = allSeats.length;
    const seatSet = new Set(allSeats.map(s => s.seatNumber));
    const occupiedSeats = new Set(activeStudents.map(s => s.seat).filter(seat => seatSet.has(seat))).size;
    
    const students = await Student.find();
    const totalIncome = allPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
    const dueFees = students.reduce((acc, s) => acc + (s.dueAmount || 0), 0);
    
    const expenses = await Expense.find();
    const totalExpenses = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
    
    res.json({
      totalStudents,
      occupiedSeats,
      totalSeats,
      totalIncome,
      totalExpenses,
      totalProfit: totalIncome - totalExpenses,
      dueFees
    });
  } catch (err) {
    console.error('Stats Error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Analytics Endpoint
app.get('/api/analytics', async (req, res) => {
  try {
    const expenses = await Expense.find();
    const payments = await Payment.find();

    const monthlyData = {};
    const yearlyData = {};

    payments.forEach(p => {
      const date = new Date(p.paymentDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const yearKey = `${date.getFullYear()}`;

      if (!monthlyData[monthKey]) monthlyData[monthKey] = { income: 0, expenses: 0 };
      if (!yearlyData[yearKey]) yearlyData[yearKey] = { income: 0, expenses: 0 };

      monthlyData[monthKey].income += p.amount;
      yearlyData[yearKey].income += p.amount;
    });

    expenses.forEach(e => {
      const date = new Date(e.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const yearKey = `${date.getFullYear()}`;

      if (!monthlyData[monthKey]) monthlyData[monthKey] = { income: 0, expenses: 0 };
      if (!yearlyData[yearKey]) yearlyData[yearKey] = { income: 0, expenses: 0 };

      monthlyData[monthKey].expenses += e.amount;
      yearlyData[yearKey].expenses += e.amount;
    });

    res.json({ monthly: monthlyData, yearly: yearlyData });
  } catch (err) {
    console.error('Analytics Error:', err);
    res.status(500).json({ message: err.message });
  }     
});

// Excel Export Endpoint
app.get('/api/export', async (req, res) => {
  try {
    const XLSX = require('xlsx');
    const expenses = await Expense.find().lean();
    const payments = await Payment.find().lean();

    const wb = XLSX.utils.book_new();
    
    const expenseData = expenses.map(e => ({
      Title: e.title,
      Category: e.category,
      Amount: e.amount,
      Date: new Date(e.date).toLocaleDateString()
    }));

    const paymentData = payments.map(p => ({
      Student: p.studentName,
      Amount: p.amount,
      Method: p.method,
      Date: new Date(p.paymentDate).toLocaleDateString(),
      Month: p.month
    }));

    const wsExpenses = XLSX.utils.json_to_sheet(expenseData);
    const wsPayments = XLSX.utils.json_to_sheet(paymentData);

    XLSX.utils.book_append_sheet(wb, wsPayments, "Income (Fees)");
    XLSX.utils.book_append_sheet(wb, wsExpenses, "Expenses (Investments)");

    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename="StudyPoint_Report.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buf);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Export failed' });
  }
});

// PDF Export Endpoint
app.get('/api/export-pdf', async (req, res) => {
  try {
    const PDFDocument = require('pdfkit');
    const expenses = await Expense.find().sort({ date: -1 });
    const payments = await Payment.find().sort({ paymentDate: -1 });
    const students = await Student.find().sort({ fullName: 1 });
    
    const doc = new PDFDocument({ margin: 50 });
    let filename = 'Library_Master_Report.pdf';
    
    res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-type', 'application/pdf');
    
    doc.pipe(res);
    
    // Header
    doc.fontSize(25).text('STUDY HUB MASTER REPORT', { align: 'center' });
    doc.fontSize(12).text('Complete Library Management & Financial Record', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Generated On: ${new Date().toLocaleString()}`, { align: 'right' });
    doc.moveDown(2);

    // Summary Section
    const totalIncome = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
    const totalExp = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
    doc.fontSize(16).text('Financial Summary', { underline: true });
    doc.fontSize(12).text(`Total Revenue (Fees): Rs.${totalIncome.toLocaleString()}`);
    doc.fontSize(12).text(`Total Investments (Expenses): Rs.${totalExp.toLocaleString()}`);
    doc.fontSize(12).text(`Net Balance: Rs.${(totalIncome - totalExp).toLocaleString()}`);
    doc.moveDown(2);
    
    // 1. Students Section
    doc.fontSize(16).text('Student Enrollment & Status', { underline: true });
    doc.moveDown();
    students.forEach(s => {
        doc.fontSize(10).text(`${s.fullName} (${s.studyId}) - Seat: ${s.seat} - Status: ${s.status} - Due: Rs.${s.dueAmount}`);
    });
    
    doc.addPage();
    
    // 2. Payments Section
    doc.fontSize(16).text('Complete Fee Collection History', { underline: true });
    doc.moveDown();
    payments.forEach(p => {
        const date = p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : 'N/A';
        doc.fontSize(10).text(`${date} - ${p.studentName} - Rs.${p.amount} (${p.month}) - ${p.method}`);
    });
    
    if (payments.length === 0) doc.fontSize(10).text('No payment records found.');

    doc.addPage();
    
    // 3. Expenses Section
    doc.fontSize(16).text('Library Expense Log', { underline: true });
    doc.moveDown();
    expenses.forEach(e => {
        const date = e.date ? new Date(e.date).toLocaleDateString() : 'N/A';
        doc.fontSize(10).text(`${date} - ${e.title} - [${e.category}] - Rs.${e.amount}`);
    });

    if (expenses.length === 0) doc.fontSize(10).text('No expense records found.');
    
    doc.end();
  } catch (err) {
    console.error('PDF Export Internal Error:', err);
    res.status(500).json({ message: 'PDF Export failed', error: err.message });
  }
});

const mongoURI = process.env.MONGODB_URI; 

if (mongoURI) {
  mongoose.connect(mongoURI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((error) => console.error('❌ MongoDB connection error:', error));
} else {
  console.warn('⚠️ MONGODB_URI is not defined in environment variables');
}

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;

