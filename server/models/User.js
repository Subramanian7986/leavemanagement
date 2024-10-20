const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'employee' },
  casualLeaveBalance: { type: Number, default: 10 },
  medicalLeaveBalance: { type: Number, default: 10 }
});

module.exports = mongoose.model('User', userSchema);
