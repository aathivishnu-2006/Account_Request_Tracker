import React from 'react';
import { Layers, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function StatsOverview({ requests }) {
  const total = requests.length;
  
  const pending = requests.filter(r => r.status === 'Pending').length;
  const inProgress = requests.filter(r => r.status === 'In Progress').length;
  const completed = requests.filter(r => r.status === 'Completed').length;
  
  // Calculate overdue count (open & past due)
  const now = new Date();
  const overdueCount = requests.filter(r => {
    const isCompleted = r.status === 'Completed' || r.status === 'Cancelled';
    const isPastDue = new Date(r.dueDate).getTime() < now.getTime();
    return !isCompleted && isPastDue;
  }).length;

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon icon-blue">
          <Layers size={22} />
        </div>
        <div className="stat-content">
          <span className="stat-label">Total Requests</span>
          <span className="stat-value">{total}</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon icon-yellow">
          <Clock size={22} />
        </div>
        <div className="stat-content">
          <span className="stat-label">Pending / In Progress</span>
          <span className="stat-value">{pending + inProgress}</span>
        </div>
      </div>

      <div className="stat-card stat-overdue">
        <div className="stat-icon icon-red">
          <AlertTriangle size={22} />
        </div>
        <div className="stat-content">
          <span className="stat-label">Overdue Requests</span>
          <span className="stat-value text-red">{overdueCount}</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon icon-green">
          <CheckCircle2 size={22} />
        </div>
        <div className="stat-content">
          <span className="stat-label">Completed</span>
          <span className="stat-value">{completed}</span>
        </div>
      </div>
    </div>
  );
}
