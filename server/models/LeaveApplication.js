const mongoose = require('mongoose');

const leaveApplicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  leaveType: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, default: 'pending' },
  reason: { type: String }
});

module.exports = mongoose.model('LeaveApplication', leaveApplicationSchema);
