import React from 'react';
import { Bell, Clock, CheckCircle } from 'lucide-react';

export default function OverdueFeed({ reminders }) {
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const d = new Date(timeStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' on ' + d.toLocaleDateString();
  };

  return (
    <div className="feed-card glass-card">
      <div className="feed-header">
        <div className="feed-title">
          <Bell size={18} className="text-red animate-pulse" />
          <h3>Automated Overdue Reminders Stream</h3>
        </div>
        <span className="live-pill">
          <span className="live-dot"></span> Live Automation
        </span>
      </div>

      <div className="feed-list">
        {reminders.length === 0 ? (
          <div className="feed-empty">
            <CheckCircle size={24} className="text-green" />
            <p>No overdue reminders recorded yet.</p>
            <span className="subtext">The background automation continuously monitors open requests.</span>
          </div>
        ) : (
          reminders.map((item) => (
            <div key={item._id} className="feed-item">
              <div className="feed-item-icon">
                <Bell size={14} />
              </div>
              <div className="feed-item-content">
                <p className="feed-msg">{item.message}</p>
                <div className="feed-meta">
                  <Clock size={12} />
                  <span>Generated at {formatTime(item.createdAt)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
