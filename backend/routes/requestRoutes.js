/**
 * Express API Routes (routes/requestRoutes.js)
 * 
 * Beginner Explanation:
 * Routes define how the backend responds to HTTP client requests (GET, POST, PUT, DELETE).
 * This controller handles:
 * - Creating requests
 * - Viewing & sorting requests by Due Date
 * - Updating request status (e.g. from 'Pending' to 'Completed')
 * - API endpoint to identify overdue requests
 * - Automation trigger to check overdue requests and create reminders
 */

const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const Reminder = require('../models/Reminder');
const {
  isMongo,
  getFallbackRequests,
  saveFallbackRequests,
  getFallbackReminders,
  saveFallbackReminders
} = require('../db');

// Helper function to check if a request is open and past its due date
const isRequestOverdue = (reqItem) => {
  const isCompleted = reqItem.status === 'Completed' || reqItem.status === 'Cancelled';
  const isPastDue = new Date(reqItem.dueDate).getTime() < Date.now();
  return !isCompleted && isPastDue;
};

// ==========================================
// 1. GET /api/requests - Get all requests (Sorted by Due Date)
// ==========================================
router.get('/requests', async (req, res) => {
  try {
    const { sortBy = 'dueDate', order = 'asc', status, search } = req.query;

    if (isMongo()) {
      let query = {};
      if (status && status !== 'All') query.status = status;
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { clientName: { $regex: search, $options: 'i' } },
          { assignee: { $regex: search, $options: 'i' } }
        ];
      }

      const sortOptions = {};
      sortOptions[sortBy] = order === 'desc' ? -1 : 1;

      const requests = await Request.find(query).sort(sortOptions);
      return res.json({ success: true, count: requests.length, data: requests });
    } else {
      // Fallback JSON Mode logic
      let requests = getFallbackRequests();

      // Filter by status
      if (status && status !== 'All') {
        requests = requests.filter(r => r.status === status);
      }

      // Filter by search string
      if (search) {
        const term = search.toLowerCase();
        requests = requests.filter(r => 
          r.title.toLowerCase().includes(term) ||
          r.clientName.toLowerCase().includes(term) ||
          r.assignee.toLowerCase().includes(term)
        );
      }

      // Sort requests by field (default: dueDate)
      requests.sort((a, b) => {
        let valA = new Date(a[sortBy]).getTime();
        let valB = new Date(b[sortBy]).getTime();
        if (order === 'desc') return valB - valA;
        return valA - valB;
      });

      return res.json({ success: true, count: requests.length, data: requests });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching requests', error: error.message });
  }
});

// ==========================================
// 2. GET /api/requests/overdue - Small API to identify & sort overdue requests
// ==========================================
router.get('/requests/overdue', async (req, res) => {
  try {
    const now = new Date();

    if (isMongo()) {
      // Find open requests (not Completed or Cancelled) where dueDate < NOW
      const overdueRequests = await Request.find({
        status: { $nin: ['Completed', 'Cancelled'] },
        dueDate: { $lt: now }
      }).sort({ dueDate: 1 }); // Sorted by due date ascending (most overdue first)

      return res.json({
        success: true,
        summary: `Identified ${overdueRequests.length} overdue requests`,
        count: overdueRequests.length,
        data: overdueRequests
      });
    } else {
      const requests = getFallbackRequests();
      const overdueRequests = requests
        .filter(isRequestOverdue)
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

      return res.json({
        success: true,
        summary: `Identified ${overdueRequests.length} overdue requests`,
        count: overdueRequests.length,
        data: overdueRequests
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error identifying overdue requests', error: error.message });
  }
});

// ==========================================
// 3. POST /api/requests - Create a new request
// ==========================================
router.post('/requests', async (req, res) => {
  try {
    const { title, clientName, assignee, dueDate, status } = req.body;

    // Validate inputs
    if (!title || !clientName || !assignee || !dueDate) {
      return res.status(400).json({ success: false, message: 'Missing required fields: title, clientName, assignee, dueDate' });
    }

    if (isMongo()) {
      const newRequest = await Request.create({
        title,
        clientName,
        assignee,
        dueDate,
        status: status || 'Pending'
      });
      return res.status(201).json({ success: true, data: newRequest });
    } else {
      const requests = getFallbackRequests();
      const newRequest = {
        _id: 'req_' + Date.now(),
        title,
        clientName,
        assignee,
        dueDate: new Date(dueDate).toISOString(),
        status: status || 'Pending',
        isOverdueReminded: false,
        lastRemindedAt: null,
        createdAt: new Date().toISOString()
      };
      requests.push(newRequest);
      saveFallbackRequests(requests);
      return res.status(201).json({ success: true, data: newRequest });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating request', error: error.message });
  }
});

// ==========================================
// 4. PUT /api/requests/:id - Update status or details
// ==========================================
router.put('/requests/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, clientName, assignee, dueDate, status } = req.body;

    if (isMongo()) {
      const updated = await Request.findByIdAndUpdate(
        id,
        { title, clientName, assignee, dueDate, status },
        { new: true, runValidators: true }
      );

      if (!updated) return res.status(404).json({ success: false, message: 'Request not found' });
      return res.json({ success: true, data: updated });
    } else {
      let requests = getFallbackRequests();
      const index = requests.findIndex(r => r._id === id);
      if (index === -1) return res.status(404).json({ success: false, message: 'Request not found' });

      if (title !== undefined) requests[index].title = title;
      if (clientName !== undefined) requests[index].clientName = clientName;
      if (assignee !== undefined) requests[index].assignee = assignee;
      if (dueDate !== undefined) requests[index].dueDate = new Date(dueDate).toISOString();
      if (status !== undefined) requests[index].status = status;

      saveFallbackRequests(requests);
      return res.json({ success: true, data: requests[index] });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating request', error: error.message });
  }
});

// ==========================================
// 5. DELETE /api/requests/:id - Delete a request
// ==========================================
router.delete('/requests/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongo()) {
      await Request.findByIdAndDelete(id);
      return res.json({ success: true, message: 'Request deleted successfully' });
    } else {
      let requests = getFallbackRequests();
      requests = requests.filter(r => r._id !== id);
      saveFallbackRequests(requests);
      return res.json({ success: true, message: 'Request deleted successfully' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting request', error: error.message });
  }
});

// ==========================================
// 6. POST /api/requests/check-overdue - Trigger reminder generation automation
// ==========================================
router.post('/requests/check-overdue', async (req, res) => {
  try {
    const now = new Date();
    let generatedReminders = [];

    if (isMongo()) {
      // Find overdue requests that haven't been completed
      const overdueList = await Request.find({
        status: { $nin: ['Completed', 'Cancelled'] },
        dueDate: { $lt: now }
      });

      for (const item of overdueList) {
        const daysOverdue = Math.ceil((now - new Date(item.dueDate)) / (1000 * 60 * 60 * 24));
        const message = `🚨 OVERDUE REMINDER: Request "${item.title}" for client "${item.clientName}" (Assigned to ${item.assignee}) is overdue by ${daysOverdue} day(s)!`;

        // Create reminder log
        const reminder = await Reminder.create({
          requestId: item._id.toString(),
          requestTitle: item.title,
          clientName: item.clientName,
          assignee: item.assignee,
          dueDate: item.dueDate,
          message
        });

        // Update request item
        item.isOverdueReminded = true;
        item.lastRemindedAt = now;
        await item.save();

        generatedReminders.push(reminder);
      }
    } else {
      let requests = getFallbackRequests();
      let reminders = getFallbackReminders();

      for (let i = 0; i < requests.length; i++) {
        const item = requests[i];
        if (isRequestOverdue(item)) {
          const daysOverdue = Math.ceil((now - new Date(item.dueDate)) / (1000 * 60 * 60 * 24));
          const message = `🚨 OVERDUE REMINDER: Request "${item.title}" for client "${item.clientName}" (Assigned to ${item.assignee}) is overdue by ${daysOverdue} day(s)!`;

          const reminderObj = {
            _id: 'rem_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            requestId: item._id,
            requestTitle: item.title,
            clientName: item.clientName,
            assignee: item.assignee,
            dueDate: item.dueDate,
            message,
            createdAt: now.toISOString()
          };

          reminders.unshift(reminderObj);
          requests[i].isOverdueReminded = true;
          requests[i].lastRemindedAt = now.toISOString();
          generatedReminders.push(reminderObj);
        }
      }

      saveFallbackRequests(requests);
      saveFallbackReminders(reminders);
    }

    return res.json({
      success: true,
      message: `Automation check completed. Generated ${generatedReminders.length} reminder(s).`,
      count: generatedReminders.length,
      reminders: generatedReminders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error checking overdue requests', error: error.message });
  }
});

// ==========================================
// 7. GET /api/reminders - Fetch log of generated reminders
// ==========================================
router.get('/reminders', async (req, res) => {
  try {
    if (isMongo()) {
      const reminders = await Reminder.find().sort({ createdAt: -1 }).limit(20);
      return res.json({ success: true, count: reminders.length, data: reminders });
    } else {
      const reminders = getFallbackReminders().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 20);
      return res.json({ success: true, count: reminders.length, data: reminders });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching reminders', error: error.message });
  }
});

module.exports = router;
