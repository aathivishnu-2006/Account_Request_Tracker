import React from 'react';
import { ArrowUpDown, AlertCircle, Trash2, Calendar, User, Building, Search } from 'lucide-react';

export default function RequestTable({
  requests,
  sortBy,
  order,
  onSortChange,
  onStatusChange,
  onDelete,
  activeFilter,
  onFilterChange,
  searchTerm,
  onSearchChange
}) {
  const now = new Date();

  // Helper to check overdue state
  const isOverdue = (req) => {
    const isCompleted = req.status === 'Completed' || req.status === 'Cancelled';
    const isPastDue = new Date(req.dueDate).getTime() < now.getTime();
    return !isCompleted && isPastDue;
  };

  // Helper for formatting date
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Calculate days difference
  const getDaysDiffText = (dateStr) => {
    const d = new Date(dateStr);
    const diffTime = d.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `${Math.abs(diffDays)} day(s) overdue`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else {
      return `Due in ${diffDays} day(s)`;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Completed': return 'badge badge-green';
      case 'In Progress': return 'badge badge-blue';
      case 'Pending': return 'badge badge-yellow';
      case 'Cancelled': return 'badge badge-gray';
      default: return 'badge';
    }
  };

  return (
    <div className="table-section glass-card">
      <div className="table-toolbar">
        <div className="filter-tabs">
          {['All', 'Overdue', 'Pending', 'In Progress', 'Completed'].map(tab => (
            <button
              key={tab}
              className={`tab-btn ${activeFilter === tab ? 'active' : ''}`}
              onClick={() => onFilterChange(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search by title, client, or assignee..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="table-responsive">
        <table className="request-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Client Name</th>
              <th>Assignee</th>
              <th 
                className="sortable-header" 
                onClick={() => onSortChange('dueDate')}
                title="Click to sort by Due Date"
              >
                <div className="header-flex">
                  <span>Due Date</span>
                  <ArrowUpDown size={14} className="sort-icon" />
                </div>
              </th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-state">
                  No requests found matching current filter criteria.
                </td>
              </tr>
            ) : (
              requests.map(req => {
                const overdue = isOverdue(req);
                return (
                  <tr key={req._id} className={overdue ? 'row-overdue' : ''}>
                    <td className="cell-title">
                      <span className="title-text">{req.title}</span>
                      {overdue && (
                        <span className="overdue-tag">
                          <AlertCircle size={12} />
                          {getDaysDiffText(req.dueDate)}
                        </span>
                      )}
                    </td>

                    <td>
                      <div className="cell-flex">
                        <Building size={14} className="icon-muted" />
                        <span>{req.clientName}</span>
                      </div>
                    </td>

                    <td>
                      <div className="cell-flex">
                        <User size={14} className="icon-muted" />
                        <span>{req.assignee}</span>
                      </div>
                    </td>

                    <td>
                      <div className="cell-flex">
                        <Calendar size={14} className="icon-muted" />
                        <span className={overdue ? 'text-red font-semibold' : ''}>
                          {formatDate(req.dueDate)}
                        </span>
                      </div>
                    </td>

                    <td>
                      <select
                        className={`status-select ${getStatusBadgeClass(req.status)}`}
                        value={req.status}
                        onChange={(e) => onStatusChange(req._id, e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => onDelete(req._id)}
                        title="Delete Request"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
