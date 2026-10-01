# 📊 Accountant Request Tracker (MERN Stack)

A complete, ready-to-run **Accountant Request Tracker** web application built with the **MERN** stack (MongoDB, Express, React, Node.js). 

This project allows accountants to track requests (`Title`, `Client Name`, `Assignee`, `Due Date`, `Status`), sort them dynamically by due date, update request statuses, and automatically detect overdue requests to generate system reminders.

---
# Quick Start Guide

### 1. Start Backend Server
Open a terminal in the project directory and run:
```bash
cd backend
npm start
```
*Backend will run at:* **`http://localhost:5000`**

### 2. Start Frontend React Dashboard
Open a second terminal in the project directory and run:
```bash
cd frontend
npm run dev
```
*Frontend will run at:* **`http://localhost:3000`**

---



## 📁 Project Directory Structure

```
Account_req_tracker/
├── backend/
│   ├── models/
│   │   ├── Request.js        # Mongoose Schema for Requests
│   │   └── Reminder.js       # Mongoose Schema for Overdue Reminders
│   ├── routes/
│   │   └── requestRoutes.js  # REST API & Overdue sorting controller
│   ├── utils/
│   │   └── reminderCron.js   # Background cron job automation
│   ├── db.js                 # Database connection & persistent storage
│   ├── seed.js               # Sample data generator
│   ├── server.js             # Express application entry point
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Header.jsx          # App header & automation trigger button
    │   │   ├── StatsOverview.jsx   # KPI statistics cards
    │   │   ├── RequestTable.jsx    # Table with sorting & inline status dropdown
    │   │   ├── RequestModal.jsx    # Form dialog to create new request
    │   │   └── OverdueFeed.jsx     # Live stream widget for overdue alerts
    │   ├── api.js                  # Clean API service layer
    │   ├── App.jsx                 # React main state container
    │   ├── App.css                 # Dark glassmorphic design system
    │   └── main.jsx                # React DOM entry point
    ├── index.html
    ├── vite.config.js
    └── package.json
```
