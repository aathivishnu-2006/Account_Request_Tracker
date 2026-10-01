import React from 'react';
import { PlusCircle, RefreshCw, ShieldAlert, FileText } from 'lucide-react';

export default function Header({ onOpenModal, onTriggerAutomation, isChecking }) {
  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="logo-icon">
          <FileText size={24} />
        </div>
        <div>
          <h1>Accountant Request Tracker</h1>
          <p className="subtitle">MERN Stack • Automated Overdue Reminders & Request Analytics</p>
        </div>
      </div>
      
      <div className="header-actions">
        <button 
          id="trigger-automation-btn" 
          className="btn btn-secondary" 
          onClick={onTriggerAutomation}
          disabled={isChecking}
          title="Manually execute overdue request automation scan"
        >
          <RefreshCw size={16} className={isChecking ? 'spin' : ''} />
          <span>{isChecking ? 'Checking...' : 'Run Overdue Automation'}</span>
        </button>

        <button 
          id="new-request-btn" 
          className="btn btn-primary" 
          onClick={onOpenModal}
        >
          <PlusCircle size={18} />
          <span>New Request</span>
        </button>
      </div>
    </header>
  );
}
