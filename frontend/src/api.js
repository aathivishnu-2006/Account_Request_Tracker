/**
 * Frontend API Service (src/api.js)
 * 
 * Beginner Explanation:
 * This file communicates between our React components and Express API server backend.
 * Uses native fetch() to perform HTTP requests (GET, POST, PUT, DELETE).
 */

const API_BASE = '/api';

export async function fetchRequests(params = {}) {
  const { sortBy = 'dueDate', order = 'asc', status = 'All', search = '' } = params;
  const url = `${API_BASE}/requests?sortBy=${sortBy}&order=${order}&status=${encodeURIComponent(status)}&search=${encodeURIComponent(search)}`;
  
  const res = await fetch(url);
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Failed to fetch requests');
  return data.data;
}

export async function fetchOverdueRequests() {
  const res = await fetch(`${API_BASE}/requests/overdue`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Failed to fetch overdue requests');
  return data.data;
}

export async function createRequest(requestData) {
  const res = await fetch(`${API_BASE}/requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestData)
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Failed to create request');
  return data.data;
}

export async function updateRequestStatus(id, newStatus) {
  const res = await fetch(`${API_BASE}/requests/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: newStatus })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Failed to update request');
  return data.data;
}

export async function deleteRequest(id) {
  const res = await fetch(`${API_BASE}/requests/${id}`, {
    method: 'DELETE'
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Failed to delete request');
  return data;
}

export async function triggerOverdueCheck() {
  const res = await fetch(`${API_BASE}/requests/check-overdue`, {
    method: 'POST'
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Failed to trigger overdue automation');
  return data;
}

export async function fetchReminders() {
  const res = await fetch(`${API_BASE}/reminders`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Failed to fetch reminders');
  return data.data;
}
