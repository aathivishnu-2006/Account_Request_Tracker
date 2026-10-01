/**
 * Database Seeder Script (seed.js)
 * 
 * Beginner Explanation:
 * This script populates sample request data so you can immediately see
 * active requests, overdue requests, and reminders in the dashboard.
 */

const { isMongo, getFallbackRequests, saveFallbackRequests, connectDB } = require('./db');
const Request = require('./models/Request');

const sampleRequests = [
  {
    title: 'Q3 Financial Audit & Reconciliation',
    clientName: 'Apex Technology Solutions',
    assignee: 'David Miller',
    dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago (OVERDUE)
    status: 'Pending'
  },
  {
    title: 'Corporate Tax Return Filing FY2026',
    clientName: 'Blue Horizon Logistics',
    assignee: 'Sarah Jenkins',
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago (OVERDUE)
    status: 'In Progress'
  },
  {
    title: 'Payroll Expense Verification',
    clientName: 'GreenTree Organics',
    assignee: 'Alex Rivera',
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days in future
    status: 'In Progress'
  },
  {
    title: 'Quarterly GST Compliance Review',
    clientName: 'Quantum Dynamics',
    assignee: 'David Miller',
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days in future
    status: 'Pending'
  },
  {
    title: 'Annual Asset Valuation Report',
    clientName: 'Summit Capital Partners',
    assignee: 'Sarah Jenkins',
    dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    status: 'Completed'
  }
];

const seedData = async () => {
  await connectDB();

  if (isMongo()) {
    console.log('🌱 Seeding MongoDB database...');
    await Request.deleteMany({});
    await Request.insertMany(sampleRequests);
    console.log('✅ Successfully seeded sample requests into MongoDB!');
  } else {
    console.log('🌱 Seeding embedded JSON database...');
    const formatted = sampleRequests.map((item, idx) => ({
      _id: 'req_seed_' + (idx + 1),
      ...item,
      isOverdueReminded: false,
      lastRemindedAt: null,
      createdAt: new Date().toISOString()
    }));
    saveFallbackRequests(formatted);
    console.log('✅ Successfully seeded sample requests into backend/data/requests.json!');
  }
};

seedData().then(() => {
  console.log('🎉 Seeding complete!');
  process.exit(0);
}).catch(err => {
  console.error('❌ Error during seeding:', err);
  process.exit(1);
});
