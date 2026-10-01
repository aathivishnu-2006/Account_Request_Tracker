/**
 * Automated Reminder Cron Service (utils/reminderCron.js)
 * 
 * Beginner Explanation:
 * A "Cron Job" is an automated background task that runs on a schedule (e.g. every minute, hour, or day).
 * In Node.js, we use `node-cron` to automatically check for overdue open requests
 * without requiring any manual user intervention.
 */

const cron = require('node-cron');
const Request = require('../models/Request');
const Reminder = require('../models/Reminder');
const {
  isMongo,
  getFallbackRequests,
  saveFallbackRequests,
  getFallbackReminders,
  saveFallbackReminders
} = require('../db');

/**
 * Core Automation Logic: Checks for open overdue requests and generates reminders
 */
const checkOverdueAndGenerateReminders = async () => {
  const now = new Date();
  console.log(`⏰ [Automation Engine] Running periodic scan for overdue requests at ${now.toLocaleTimeString()}...`);

  try {
    if (isMongo()) {
      // Find open requests (not Completed/Cancelled) past their due date
      const overdueItems = await Request.find({
        status: { $nin: ['Completed', 'Cancelled'] },
        dueDate: { $lt: now }
      });

      if (overdueItems.length === 0) {
        console.log('   ✅ No overdue open requests found.');
        return;
      }

      for (const item of overdueItems) {
        const daysOverdue = Math.max(1, Math.ceil((now - new Date(item.dueDate)) / (1000 * 60 * 60 * 24)));
        const message = `🔔 AUTOMATED REMINDER: Request "${item.title}" for client "${item.clientName}" assigned to ${item.assignee} is ${daysOverdue} day(s) overdue!`;

        // Save reminder record to database
        await Reminder.create({
          requestId: item._id.toString(),
          requestTitle: item.title,
          clientName: item.clientName,
          assignee: item.assignee,
          dueDate: item.dueDate,
          message
        });

        // Mark item as reminded
        item.isOverdueReminded = true;
        item.lastRemindedAt = now;
        await item.save();

        console.log(`   🚨 [REMINDER GENERATED] ${message}`);
      }
    } else {
      // Fallback mode logic
      let requests = getFallbackRequests();
      let reminders = getFallbackReminders();
      let count = 0;

      for (let i = 0; i < requests.length; i++) {
        const item = requests[i];
        const isCompleted = item.status === 'Completed' || item.status === 'Cancelled';
        const isPastDue = new Date(item.dueDate).getTime() < now.getTime();

        if (!isCompleted && isPastDue) {
          const daysOverdue = Math.max(1, Math.ceil((now - new Date(item.dueDate)) / (1000 * 60 * 60 * 24)));
          const message = `🔔 AUTOMATED REMINDER: Request "${item.title}" for client "${item.clientName}" assigned to ${item.assignee} is ${daysOverdue} day(s) overdue!`;

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
          count++;

          console.log(`   🚨 [REMINDER GENERATED] ${message}`);
        }
      }

      if (count > 0) {
        saveFallbackRequests(requests);
        saveFallbackReminders(reminders);
      } else {
        console.log('   ✅ No overdue open requests found.');
      }
    }
  } catch (err) {
    console.error('❌ Error during background overdue check:', err.message);
  }
};

/**
 * Initializes the automated scheduler
 * Schedule pattern: '* * * * *' = Runs every minute
 */
const initReminderCron = () => {
  console.log('⚡ Initializing Automated Overdue Reminder Service...');
  
  // Schedule to run every 1 minute
  cron.schedule('* * * * *', () => {
    checkOverdueAndGenerateReminders();
  });

  // Run an immediate check on startup
  setTimeout(() => {
    checkOverdueAndGenerateReminders();
  }, 3000);
};

module.exports = { initReminderCron, checkOverdueAndGenerateReminders };
