/**
 * Reminder Model (models/Reminder.js)
 * 
 * Beginner Explanation:
 * When an open request passes its due date, our automated system generates
 * a reminder record to alert accountants. This schema stores those reminders.
 */

const mongoose = require('mongoose');

const ReminderSchema = new mongoose.Schema({
  requestId: {
    type: String,
    required: true
  },
  requestTitle: {
    type: String,
    required: true
  },
  clientName: {
    type: String,
    required: true
  },
  assignee: {
    type: String,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Reminder', ReminderSchema);
