import React, { useState } from 'react';
import { X, Calendar, User, Building, FileText } from 'lucide-react';

export default function RequestModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    title: '',
    clientName: '',
    assignee: '',
    dueDate: '',
    status: 'Pending'
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.clientName || !formData.assignee || !formData.dueDate) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit(formData);
      setFormData({
        title: '',
        clientName: '',
        assignee: '',
        dueDate: '',
        status: 'Pending'
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Error creating request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content glass-card">
        <div className="modal-header">
          <h2>Create New Accountant Request</h2>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="request-form">
          <div className="form-group">
            <label htmlFor="title">Request Title *</label>
            <div className="input-wrapper">
              <FileText size={18} className="input-icon" />
              <input
                id="title"
                type="text"
                name="title"
                placeholder="e.g. Q3 Financial Statement & Tax Return"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="clientName">Client Name *</label>
              <div className="input-wrapper">
                <Building size={18} className="input-icon" />
                <input
                  id="clientName"
                  type="text"
                  name="clientName"
                  placeholder="e.g. Acme Corporation"
                  value={formData.clientName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="assignee">Assignee Accountant *</label>
              <div className="input-wrapper">
                <User size={18} className="input-icon" />
                <input
                  id="assignee"
                  type="text"
                  name="assignee"
                  placeholder="e.g. Sarah Jenkins"
                  value={formData.assignee}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dueDate">Due Date *</label>
              <div className="input-wrapper">
                <Calendar size={18} className="input-icon" />
                <input
                  id="dueDate"
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="status">Initial Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
