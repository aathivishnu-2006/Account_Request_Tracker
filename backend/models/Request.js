/**
 * Request Model (models/Request.js)
 * 
 * Beginner Explanation:
 * Mongoose schemas define the blueprint/structure of objects saved in MongoDB.
 * Each Accountant Request requires:
 * 1. Title (What task needs to be done)
 * 2. Client Name (Who the request is for)
 * 3. Assignee (Which accountant is responsible)
 * 4. Due Date (When it must be finished)
 * 5. Status ('Pending', 'In Progress', 'Completed')
 */

const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title for the request'],
    trim: true
  },
  clientName: {
    type: String,
    required: [true, 'Please provide the client name'],
    trim: true
  },
  assignee: {
    type: String,
    required: [true, 'Please specify an assignee'],
    trim: true
  },
  dueDate: {
    type: Date,
    required: [true, 'Please select a due date']
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  isOverdueReminded: {
    type: Boolean,
    default: false
  },
  lastRemindedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Request', RequestSchema);
