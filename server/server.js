const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const User = require('./models/User');
const LeaveApplication = require('./models/LeaveApplication');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path'); // Add this line

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb+srv://953622205045:Sri@22205045@mern.xa35g.mongodb.net/leave-management?retryWrites=true&w=majority')
  .then(() => {
    console.log('Connected to MongoDB');
    insertAdminUser(); // Call the function to insert admin if not present
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

// Middleware for token validation
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, 'your_jwt_secret', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Function to insert admin user if not present
const insertAdminUser = async () => {
  const adminExists = await User.findOne({ email: 'admin@gmail.com' });

  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin', 10);
    const adminUser = new User({
      username: 'admin',
      email: 'admin@gmail.com',
      password: hashedPassword,
      role: 'admin', // Explicitly set the role to 'admin'
      casualLeaveBalance: 0, // Admin doesn't need leave balances
      medicalLeaveBalance: 0,
    });
    await adminUser.save();
    console.log('Admin user created successfully.');
  } else {
    console.log('Admin user already exists.');
  }
};

// Routes
app.get('/api/user/details', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId); // Assuming req.user.userId contains the user's ID
    if (!user) return res.status(404).send('User not found');
    res.json({ username: user.username }); // Adjust according to your User schema
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Register Endpoint with Email Check
app.post('/api/register', async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  // Check if passwords match
  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "Email already registered" });
  }

  // Hash the password and create a new user
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, email, password: hashedPassword });
  await user.save();

  // Respond with success and allow the frontend to handle the redirection
  res.status(201).json({ message: "User registered successfully" });
});

// Login Endpoint with role-based redirection
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  // Generate JWT token and include the user's role
  const token = jwt.sign({ userId: user._id, role: user.role }, 'your_jwt_secret', { expiresIn: '1h' });

  // Send role along with token for frontend to handle redirection
  res.json({ token, role: user.role });
});

// Helper function to calculate the number of days between two dates
const calculateLeaveDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const oneDay = 24 * 60 * 60 * 1000; // Hours * Minutes * Seconds * Milliseconds
  return Math.round((end - start) / oneDay) + 1; // Adding 1 to include the end day
};

// Apply for Leave Endpoint
app.post('/api/leaves/apply', authenticateToken, async (req, res) => {
  const { leaveType, startDate, endDate, reason } = req.body;
  const user = await User.findById(req.user.userId);

  // Calculate the number of leave days
  const leaveDays = calculateLeaveDays(startDate, endDate);

  // Check if the user has enough leave balance for the requested leave type
  if (leaveType === 'casual' && user.casualLeaveBalance < leaveDays) {
    return res.status(400).json({ message: `You only have ${user.casualLeaveBalance} casual leave days left.` });
  } else if (leaveType === 'medical' && user.medicalLeaveBalance < leaveDays) {
    return res.status(400).json({ message: `You only have ${user.medicalLeaveBalance} medical leave days left.` });
  }

  // Create a new leave application
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
});

// Get Leave Balance
app.get('/api/leaves/balance', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    // Check if user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

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
  const applications = await LeaveApplication.find({ userId: req.user.userId });
  res.json(applications);
});

// Admin Endpoints
app.get('/api/leaves/all', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  
  try {
    // Populate the userId field to fetch username and email from the User model
    const applications = await LeaveApplication.find().populate('userId', 'username email');
    
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/leaves/approve', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  const { applicationId } = req.body;
  const application = await LeaveApplication.findById(applicationId);

  if (application) {
    application.status = 'approved';
    
    // Deduct the leave balance based on leave type
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
});

app.post('/api/leaves/reject', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  const { applicationId } = req.body;
  const application = await LeaveApplication.findById(applicationId);

  if (application) {
    application.status = 'rejected';
    await application.save();
    res.json({ message: "Leave application rejected" });
  } else {
    res.status(404).json({ message: "Application not found" });
  }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/build')));

// For any request that doesn't match API routes, serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
