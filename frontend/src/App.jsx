import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import StatsOverview from './components/StatsOverview';
import RequestTable from './components/RequestTable';
import RequestModal from './components/RequestModal';
import OverdueFeed from './components/OverdueFeed';
import {
  fetchRequests,
  fetchOverdueRequests,
  createRequest,
  updateRequestStatus,
  deleteRequest,
  triggerOverdueCheck,
  fetchReminders
} from './api';

export default function App() {
  const [requests, setRequests] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');
  const [order, setOrder] = useState('asc');
  const [isChecking, setIsChecking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load requests data
  const loadData = useCallback(async () => {
    try {
      if (activeFilter === 'Overdue') {
        const overdueData = await fetchOverdueRequests();
        setRequests(overdueData);
      } else {
        const filterStatus = activeFilter === 'All' ? 'All' : activeFilter;
        const data = await fetchRequests({
          sortBy,
          order,
          status: filterStatus,
          search: searchTerm
        });
        setRequests(data);
      }
    } catch (err) {
      console.error('Failed to load requests:', err);
    } finally {
      setLoading(false);
    }
  }, [activeFilter, sortBy, order, searchTerm]);

  // Load reminders
  const loadReminders = async () => {
    try {
      const data = await fetchReminders();
      setReminders(data);
    } catch (err) {
      console.error('Failed to load reminders:', err);
    }
  };

  useEffect(() => {
    loadData();
    loadReminders();

    // Auto refresh every 15 seconds to sync background cron reminders
    const interval = setInterval(() => {
      loadData();
      loadReminders();
    }, 15000);

    return () => clearInterval(interval);
  }, [loadData]);

  // Handle new request creation
  const handleCreateRequest = async (formData) => {
    const newReq = await createRequest(formData);
    showToast(`Created request: "${newReq.title}"`);
    loadData();
  };

  // Handle inline status toggle
  const handleStatusChange = async (id, newStatus) => {
    await updateRequestStatus(id, newStatus);
    showToast(`Updated status to "${newStatus}"`);
    loadData();
  };

  // Handle deletion
  const handleDeleteRequest = async (id) => {
    if (window.confirm('Are you sure you want to delete this request?')) {
      await deleteRequest(id);
      showToast('Request deleted');
      loadData();
    }
  };

  // Handle sorting header click
  const handleSortChange = (field) => {
    if (sortBy === field) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setOrder('asc');
    }
  };

  // Manual Trigger Automation button handler
  const handleTriggerAutomation = async () => {
    try {
      setIsChecking(true);
      const res = await triggerOverdueCheck();
      showToast(res.message);
      await loadData();
      await loadReminders();
    } catch (err) {
      showToast('Error triggering automation');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="app-layout">
      {toastMessage && <div className="toast-notification">{toastMessage}</div>}

      <Header
        onOpenModal={() => setIsModalOpen(true)}
        onTriggerAutomation={handleTriggerAutomation}
        isChecking={isChecking}
      />

      <main className="main-content">
        <StatsOverview requests={requests} />

        <div className="dashboard-grid">
          <div className="grid-left">
            <RequestTable
              requests={requests}
              sortBy={sortBy}
              order={order}
              onSortChange={handleSortChange}
              onStatusChange={handleStatusChange}
              onDelete={handleDeleteRequest}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
          </div>

          <div className="grid-right">
            <OverdueFeed reminders={reminders} />
          </div>
        </div>
      </main>

      <RequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateRequest}
      />
    </div>
  );
}
