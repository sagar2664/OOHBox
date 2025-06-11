import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getAdminAnalytics, getUsers, updateUser, deleteUser, getPendingHoardings, updateHoardingStatus } from '../api/api';

export default function AdminDashboard() {
  const { token } = useAuth();
  // Stats
  const [stats, setStats] = useState({ users: 0, hoardings: 0, bookings: 0 });
  // Users
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [userTotal, setUserTotal] = useState(0);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    role: '',
    inactive: false
  });
  // Hoardings
  const [hoardings, setHoardings] = useState([]);
  const [hoardingSearch, setHoardingSearch] = useState('');
  const [hoardingPage, setHoardingPage] = useState(1);
  const [hoardingTotalPages, setHoardingTotalPages] = useState(1);
  // Loading/Error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch stats
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    getAdminAnalytics(token).then(data => {
      setStats({
        users: data.userStats?.reduce((a, b) => a + b.count, 0) || 0,
        hoardings: data.hoardingStats?.reduce((a, b) => a + b.count, 0) || 0,
        bookings: data.bookingStats?.reduce((a, b) => a + b.count, 0) || 0,
      });
      setLoading(false);
    }).catch(err => {
      setError('Failed to load stats');
      setLoading(false);
    });
  }, [token]);

  // Fetch users
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    getUsers({ page: userPage, search: userSearch }, token).then(data => {
      setUsers(data.users || []);
      setUserTotalPages(data.totalPages || 1);
      setUserTotal(data.totalUsers || 0);
      setLoading(false);
    }).catch(err => {
      setError('Failed to load users');
      setLoading(false);
    });
  }, [userPage, userSearch, token]);

  // Fetch hoardings
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    getPendingHoardings({ page: hoardingPage, search: hoardingSearch }, token).then(data => {
      setHoardings(data.hoardings || []);
      setHoardingTotalPages(data.totalPages || 1);
      setLoading(false);
    }).catch(err => {
      setError('Failed to load hoardings');
      setLoading(false);
    });
  }, [hoardingPage, hoardingSearch, token]);

  // User actions
  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      setLoading(true);
      const response = await deleteUser(id, token);
      if (response) {
        setUsers(users.filter(u => u._id !== id));
        setUserTotal(prev => prev - 1);
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to delete user');
      setLoading(false);
    }
  };

  const handleToggleInactive = async (id, inactive) => {
    try {
      setLoading(true);
      const updatedUser = await updateUser(id, { inactive }, token);
      setUsers(users.map(u => u._id === id ? updatedUser : u));
      setLoading(false);
    } catch (err) {
      setError('Failed to update user status');
      setLoading(false);
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user._id);
    setEditForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber || '',
      role: user.role
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updatedUser = await updateUser(editingUser, editForm, token);
      setUsers(users.map(u => u._id === editingUser ? updatedUser : u));
      setEditingUser(null);
      setLoading(false);
    } catch (err) {
      setError('Failed to update user');
      setLoading(false);
    }
  };

  const handleEditCancel = () => {
    setEditingUser(null);
  };

  // Hoarding actions
  const handleApprove = async (id) => {
    await updateHoardingStatus(id, 'approved', token);
    setHoardings(hoardings.filter(h => h._id !== id));
  };
  const handleReject = async (id) => {
    await updateHoardingStatus(id, 'rejected', token);
    setHoardings(hoardings.filter(h => h._id !== id));
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-2 md:px-0">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded shadow p-6 flex flex-col items-center">
          <div className="text-3xl font-bold text-blue-600">{stats.users}</div>
          <div className="text-gray-500 mt-2">Total Users</div>
        </div>
        <div className="bg-white rounded shadow p-6 flex flex-col items-center">
          <div className="text-3xl font-bold text-blue-600">{stats.hoardings}</div>
          <div className="text-gray-500 mt-2">Total Hoardings</div>
        </div>
        <div className="bg-white rounded shadow p-6 flex flex-col items-center">
          <div className="text-3xl font-bold text-blue-600">{stats.bookings}</div>
          <div className="text-gray-500 mt-2">Total Bookings</div>
        </div>
      </div>
      {/* User Management */}
      <div className="bg-white rounded shadow p-6 mb-8">
        <h2 className="font-semibold text-lg mb-2">User Management</h2>
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            placeholder="Search by name or email..."
            className="border px-3 py-2 rounded w-full md:w-1/3"
            value={userSearch}
            onChange={e => {
              setUserSearch(e.target.value);
              setUserPage(1);
            }}
          />
          <div className="text-gray-500">
            Total Users: {userTotal}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left">First Name</th>
                <th className="px-3 py-2 text-left">Last Name</th>
                <th className="px-3 py-2 text-left">Email</th>
                <th className="px-3 py-2 text-left">Role</th>
                <th className="px-3 py-2 text-left">Phone Number</th>
                <th className="px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} className="border-b">
                  {editingUser === u._id ? (
                    <>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={editForm.firstName}
                          onChange={e => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                          className="border px-2 py-1 rounded w-full"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={editForm.lastName}
                          onChange={e => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                          className="border px-2 py-1 rounded w-full"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={e => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                          className="border px-2 py-1 rounded w-full"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={editForm.role}
                          onChange={e => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                          className="border px-2 py-1 rounded w-full"
                        >
                          <option value="buyer">Buyer</option>
                          <option value="vendor">Vendor</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="tel"
                          value={editForm.phoneNumber}
                          onChange={e => setEditForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                          className="border px-2 py-1 rounded w-full"
                        />
                      </td>
                      <td className="px-3 py-2 flex gap-2">
                        <button
                          className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs"
                          onClick={handleEditSubmit}
                        >
                          Save
                        </button>
                        <button
                          className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                          onClick={handleEditCancel}
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-3 py-2">{u.firstName}</td>
                      <td className="px-3 py-2">{u.lastName}</td>
                      <td className="px-3 py-2">{u.email}</td>
                      <td className="px-3 py-2">{u.role}</td>
                      <td className="px-3 py-2">{u.phoneNumber}</td>
                      <td className="px-3 py-2 flex gap-2">
                        <button
                          className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs"
                          onClick={() => handleEditClick(u)}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs"
                          onClick={() => handleDeleteUser(u._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {users.length === 0 && <tr><td colSpan={6} className="text-center py-4 text-gray-400">No users found.</td></tr>}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex gap-2 mt-4">
          <button className="px-3 py-1 rounded bg-gray-200" disabled={userPage === 1} onClick={() => setUserPage(p => Math.max(1, p - 1))}>Prev</button>
          <span>Page {userPage} of {userTotalPages}</span>
          <button className="px-3 py-1 rounded bg-gray-200" disabled={userPage === userTotalPages} onClick={() => setUserPage(p => Math.min(userTotalPages, p + 1))}>Next</button>
        </div>
      </div>
      {/* Hoarding Approval */}
      <div className="bg-white rounded shadow p-6 mb-8">
        <h2 className="font-semibold text-lg mb-2">Hoarding Approval</h2>
        <input
          type="text"
          placeholder="Search by hoarding or vendor..."
          className="border px-3 py-2 rounded mb-4 w-full md:w-1/3"
          value={hoardingSearch}
          onChange={e => setHoardingSearch(e.target.value)}
        />
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left">Hoarding Name</th>
                <th className="px-3 py-2 text-left">Vendor Name</th>
                <th className="px-3 py-2 text-left">Location</th>
                <th className="px-3 py-2 text-left">Submission Date</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {hoardings.map(h => (
                <tr key={h._id} className="border-b">
                  <td className="px-3 py-2">{h.name}</td>
                  <td className="px-3 py-2">{h.vendorId?.username || h.vendorId?.firstName || '-'}</td>
                  <td className="px-3 py-2">{h.location?.address}</td>
                  <td className="px-3 py-2">{new Date(h.createdAt).toLocaleDateString()}</td>
                  <td className="px-3 py-2">
                    <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs">Pending</span>
                  </td>
                  <td className="px-3 py-2 flex gap-2">
                    <button className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs" onClick={() => handleApprove(h._id)}>Approve</button>
                    <button className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs" onClick={() => handleReject(h._id)}>Reject</button>
                  </td>
                </tr>
              ))}
              {hoardings.length === 0 && <tr><td colSpan={6} className="text-center py-4 text-gray-400">No pending hoardings found.</td></tr>}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex gap-2 mt-4">
          <button className="px-3 py-1 rounded bg-gray-200" disabled={hoardingPage === 1} onClick={() => setHoardingPage(p => Math.max(1, p - 1))}>Prev</button>
          <span>Page {hoardingPage} of {hoardingTotalPages}</span>
          <button className="px-3 py-1 rounded bg-gray-200" disabled={hoardingPage === hoardingTotalPages} onClick={() => setHoardingPage(p => Math.min(hoardingTotalPages, p + 1))}>Next</button>
        </div>
      </div>
      {error && <div className="text-red-600 text-center mt-4">{error}</div>}
    </div>
  );
} 