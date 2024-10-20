const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const User = require('./models/User');
const LeaveApplication = require('./models/LeaveApplication');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    insertAdminUser(); // Call the function to insert admin if not present
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

// Middleware for token validation
const authenticateToken = (req, res, next) => {
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1]; // Extract token after "Bearer "
  
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => { // Use env variable for secret
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Function to insert admin user if not present
const insertAdminUser = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@gmail.com' });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin', 10);
      const adminUser = new User({
        username: 'admin',
        email: 'admin@gmail.com',
        password: hashedPassword,
        role: 'admin',
        casualLeaveBalance: 0,
        medicalLeaveBalance: 0,
      });
      await adminUser.save();
      console.log('Admin user created successfully.');
    } else {
      console.log('Admin user already exists.');
    }
  } catch (error) {
    console.error('Error inserting admin user:', error);
  }
};

// Routes
app.get('/api/user/details', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).send('User not found');
    res.json({ username: user.username });
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Register Endpoint with Email Check
app.post('/api/register', async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error during registration" });
  }
});

// Login Endpoint with role-based redirection
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, role: user.role });
  } catch (error) {
    res.status(500).json({ message: "Server error during login" });
  }
});

// Helper function to calculate the number of days between two dates
const calculateLeaveDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round((end - start) / oneDay) + 1;
};

// Apply for Leave Endpoint
app.post('/api/leaves/apply', authenticateToken, async (req, res) => {
  const { leaveType, startDate, endDate, reason } = req.body;
  try {
    const user = await User.findById(req.user.userId);
    const leaveDays = calculateLeaveDays(startDate, endDate);

    if (leaveType === 'casual' && user.casualLeaveBalance < leaveDays) {
      return res.status(400).json({ message: `You only have ${user.casualLeaveBalance} casual leave days left.` });
    } else if (leaveType === 'medical' && user.medicalLeaveBalance < leaveDays) {
      return res.status(400).json({ message: `You only have ${user.medicalLeaveBalance} medical leave days left.` });
    }

    const leaveApplication = new LeaveApplication({
      userId: user._id,
      leaveType,
      startDate,
      endDate,
      reason,
      status: 'pending'
    });

    await leaveApplication.save();
    res.status(201).json({ message: `Leave applied successfully for ${leaveDays} days.` });
  } catch (error) {
    res.status(500).json({ message: "Server error while applying for leave" });
  }
});

// Get Leave Balance
app.get('/api/leaves/balance', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      casualLeaveBalance: user.casualLeaveBalance,
      medicalLeaveBalance: user.medicalLeaveBalance,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "An error occurred while retrieving leave balance" });
  }
});

// Get Leave History
app.get('/api/leaves/history', authenticateToken, async (req, res) => {
  try {
    const applications = await LeaveApplication.find({ userId: req.user.userId });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: "Server error while retrieving leave history" });
  }
});

// Admin Endpoints
app.get('/api/leaves/all', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  
  try {
    const applications = await LeaveApplication.find().populate('userId', 'username email');
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/leaves/approve', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  const { applicationId } = req.body;

  try {
    const application = await LeaveApplication.findById(applicationId);
    if (application) {
      application.status = 'approved';
      
      const user = await User.findById(application.userId);
      const leaveDays = calculateLeaveDays(application.startDate, application.endDate);
      
      if (application.leaveType === 'casual') {
        user.casualLeaveBalance -= leaveDays;
      } else if (application.leaveType === 'medical') {
        user.medicalLeaveBalance -= leaveDays;
      }
      
      await user.save();
      await application.save();
      res.json({ message: "Leave application approved" });
    } else {
      res.status(404).json({ message: "Application not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error while approving leave" });
  }
});

app.post('/api/leaves/reject', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  const { applicationId } = req.body;

  try {
    const application = await LeaveApplication.findById(applicationId);
    if (application) {
      application.status = 'rejected';
      await application.save();
      res.json({ message: "Leave application rejected" });
    } else {
      res.status(404).json({ message: "Application not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error while rejecting leave" });
  }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
