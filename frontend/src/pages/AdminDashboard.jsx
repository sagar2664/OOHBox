import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  getAdminAnalytics, 
  getUsers, 
  updateUser, 
  deleteUser, 
  getPendingHoardings, 
  updateHoardingStatus,
  getHoardings,
  getMyBookings,
  updateVerification
} from '../api/api';

// Icon component for consistent styling
const Icon = ({ path, className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={path} />
  </svg>
);

// Status badge component
const StatusBadge = ({ status, type = 'default' }) => {
  const statusMap = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    completed: "bg-blue-100 text-blue-800",
    cancelled: "bg-gray-100 text-gray-800",
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
    verified: "bg-green-100 text-green-800",
    unverified: "bg-red-100 text-red-800"
  };
  
  const normalizedStatus = status?.toLowerCase() || 'unknown';
  return (
    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full capitalize ${statusMap[normalizedStatus] || "bg-gray-200 text-gray-600"}`}>
      {normalizedStatus.replace('_', ' ')}
    </span>
  );
};

// Stat card component
const StatCard = ({ title, value, icon, color, description, trend }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        {trend && (
          <p className={`text-xs ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? '+' : ''}{trend}% from last month
          </p>
        )}
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        {icon}
      </div>
    </div>
    {description && <p className="text-xs text-gray-400 mt-3">{description}</p>}
  </div>
);

// Empty state component
const EmptyState = ({ message, icon, action }) => (
  <div className="text-center py-12">
    <div className="text-gray-400 mb-4">
      {icon}
    </div>
    <p className="text-gray-500 mb-4">{message}</p>
    {action && action}
  </div>
);

export default function AdminDashboard() {
  const { token } = useAuth();
  
  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Analytics data
  const [analytics, setAnalytics] = useState({});
  
  // Users management
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
  
  // Hoardings management
  const [hoardings, setHoardings] = useState([]);
  const [hoardingSearch, setHoardingSearch] = useState('');
  const [hoardingPage, setHoardingPage] = useState(1);
  const [hoardingTotalPages, setHoardingTotalPages] = useState(1);
  const [hoardingStatusFilter, setHoardingStatusFilter] = useState('all');
  
  // Bookings management
  const [bookings, setBookings] = useState([]);
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingPage, setBookingPage] = useState(1);
  const [bookingTotalPages, setBookingTotalPages] = useState(1);
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');
  
  // Reviews management
  const [reviews, setReviews] = useState([]);
  const [reviewSearch, setReviewSearch] = useState('');
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewTotalPages, setReviewTotalPages] = useState(1);
  const [reviewRatingFilter, setReviewRatingFilter] = useState('all');

  // Tabs configuration
  const TABS = {
    overview: 'Overview',
    users: 'User Management',
    hoardings: 'Hoarding Management',
    bookings: 'Booking Management',
    reviews: 'Review Management',
    analytics: 'Analytics'
  };

  // Fetch analytics data
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    getAdminAnalytics(token).then(data => {
      setAnalytics(data);
      setLoading(false);
    }).catch(err => {
      setError('Failed to load analytics');
      setLoading(false);
    });
  }, [token]);

  // Fetch users
  useEffect(() => {
    if (!token || activeTab !== 'users') return;
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
  }, [userPage, userSearch, token, activeTab]);

  // Fetch hoardings
  useEffect(() => {
    if (!token || activeTab !== 'hoardings') return;
    setLoading(true);
    const params = { page: hoardingPage, search: hoardingSearch };
    if (hoardingStatusFilter !== 'all') params.status = hoardingStatusFilter;
    
    getHoardings(params).then(data => {
      setHoardings(data.hoardings || []);
      setHoardingTotalPages(data.totalPages || 1);
      setLoading(false);
    }).catch(err => {
      setError('Failed to load hoardings');
      setLoading(false);
    });
  }, [hoardingPage, hoardingSearch, hoardingStatusFilter, token, activeTab]);

  // Fetch bookings
  useEffect(() => {
    if (!token || activeTab !== 'bookings') return;
    setLoading(true);
    const params = { page: bookingPage, search: bookingSearch };
    if (bookingStatusFilter !== 'all') params.status = bookingStatusFilter;
    
    getMyBookings(token).then(data => {
      setBookings(data.bookings || []);
      setBookingTotalPages(data.totalPages || 1);
      setLoading(false);
    }).catch(err => {
      setError('Failed to load bookings');
      setLoading(false);
    });
  }, [bookingPage, bookingSearch, bookingStatusFilter, token, activeTab]);

  // User actions
  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      setLoading(true);
      await deleteUser(id, token);
      setUsers(users.filter(u => u._id !== id));
      setUserTotal(prev => prev - 1);
      setLoading(false);
    } catch (err) {
      setError('Failed to delete user');
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
  const handleHoardingStatusUpdate = async (id, status) => {
    try {
      setLoading(true);
      await updateHoardingStatus(id, status, token);
      setHoardings(hoardings.filter(h => h._id !== id));
      setLoading(false);
    } catch (err) {
      setError('Failed to update hoarding status');
      setLoading(false);
    }
  };

  const handleVerificationUpdate = async (id, status) => {
    try {
      setLoading(true);
      await updateVerification(id, { status }, token);
      setHoardings(hoardings.map(h => 
        h._id === id ? { ...h, verification: { ...h.verification, status } } : h
      ));
      setLoading(false);
    } catch (err) {
      setError('Failed to update verification status');
      setLoading(false);
    }
  };

  // Computed stats
  const computedStats = useMemo(() => {
    const userStats = analytics.userStats || [];
    const bookingStats = analytics.bookingStats || [];
    const hoardingStats = analytics.hoardingStats || [];
    const reviewStats = analytics.reviewStats || {};

    return {
      totalUsers: userStats.reduce((sum, stat) => sum + stat.count, 0),
      totalBookings: bookingStats.reduce((sum, stat) => sum + stat.count, 0),
      totalHoardings: hoardingStats.reduce((sum, stat) => sum + stat.count, 0),
      totalRevenue: bookingStats.reduce((sum, stat) => sum + (stat.totalRevenue || 0), 0),
      averageRating: reviewStats.averageRating || 0,
      totalReviews: reviewStats.totalReviews || 0,
      pendingHoardings: hoardingStats.find(s => s._id === 'pending')?.count || 0,
      pendingBookings: bookingStats.find(s => s._id === 'pending')?.count || 0
    };
  }, [analytics]);

  if (loading && activeTab === 'overview') {
    return <div className="text-center py-20">Loading Admin Dashboard...</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">Admin Dashboard</h1>
          <p className="mt-1 text-gray-500">Complete platform management and oversight</p>
        </header>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
            {error}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {Object.keys(TABS).map(tabKey => (
              <button
                key={tabKey}
                onClick={() => setActiveTab(tabKey)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tabKey
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {TABS[tabKey]}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Users"
                  value={computedStats.totalUsers}
                  icon={<Icon path="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />}
                  color="bg-blue-100 text-blue-600"
                  description="Registered platform users"
                />
                <StatCard
                  title="Total Hoardings"
                  value={computedStats.totalHoardings}
                  icon={<Icon path="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />}
                  color="bg-green-100 text-green-600"
                  description="Listed advertising spaces"
                />
                <StatCard
                  title="Total Bookings"
                  value={computedStats.totalBookings}
                  icon={<Icon path="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />}
                  color="bg-purple-100 text-purple-600"
                  description="Total booking transactions"
                />
                <StatCard
                  title="Total Revenue"
                  value={`₹${computedStats.totalRevenue.toLocaleString('en-IN')}`}
                  icon={<Icon path="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />}
                  color="bg-yellow-100 text-yellow-600"
                  description="Platform revenue generated"
                />
              </div>

              {/* Pending Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Pending Actions</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Pending Hoardings</span>
                      <span className="font-semibold text-yellow-600">{computedStats.pendingHoardings}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Pending Bookings</span>
                      <span className="font-semibold text-yellow-600">{computedStats.pendingBookings}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveTab('hoardings')}
                    className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
                  >
                    Review Pending Items
                  </button>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Platform Health</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Average Rating</span>
                      <span className="font-semibold text-green-600">{computedStats.averageRating.toFixed(1)}/5</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total Reviews</span>
                      <span className="font-semibold text-blue-600">{computedStats.totalReviews}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-800">User Management</h2>
                <p className="text-gray-500 mt-1">Manage all platform users</p>
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    className="border px-4 py-2 rounded-lg w-full md:w-1/3"
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
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map(user => (
                        <tr key={user._id} className="hover:bg-gray-50">
                          {editingUser === user._id ? (
                            <>
                              <td className="px-4 py-4">
                                <input
                                  type="text"
                                  value={editForm.firstName}
                                  onChange={e => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                                  className="border px-3 py-2 rounded w-full"
                                />
                              </td>
                              <td className="px-4 py-4">
                                <input
                                  type="email"
                                  value={editForm.email}
                                  onChange={e => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                                  className="border px-3 py-2 rounded w-full"
                                />
                              </td>
                              <td className="px-4 py-4">
                                <select
                                  value={editForm.role}
                                  onChange={e => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                                  className="border px-3 py-2 rounded w-full"
                                >
                                  <option value="buyer">Buyer</option>
                                  <option value="vendor">Vendor</option>
                                  <option value="admin">Admin</option>
                                </select>
                              </td>
                              <td className="px-4 py-4">
                                <input
                                  type="tel"
                                  value={editForm.phoneNumber}
                                  onChange={e => setEditForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                                  className="border px-3 py-2 rounded w-full"
                                />
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex gap-2">
                                  <button
                                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                                    onClick={handleEditSubmit}
                                  >
                                    Save
                                  </button>
                                  <button
                                    className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                                    onClick={handleEditCancel}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.firstName} {user.lastName}
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{user.email}</div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <StatusBadge status={user.role} />
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{user.phoneNumber || '-'}</div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="flex gap-2">
                                  <button
                                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                                    onClick={() => handleEditClick(user)}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                                    onClick={() => handleDeleteUser(user._id)}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {users.length === 0 && (
                  <EmptyState 
                    message="No users found"
                    icon={<Icon path="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" className="w-16 h-16 mx-auto" />}
                  />
                )}

                {/* Pagination */}
                <div className="flex justify-between items-center mt-6">
                  <div className="text-sm text-gray-700">
                    Showing page {userPage} of {userTotalPages}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      className="px-4 py-2 border rounded-lg disabled:opacity-50"
                      disabled={userPage === 1}
                      onClick={() => setUserPage(p => Math.max(1, p - 1))}
                    >
                      Previous
                    </button>
                    <button 
                      className="px-4 py-2 border rounded-lg disabled:opacity-50"
                      disabled={userPage === userTotalPages}
                      onClick={() => setUserPage(p => Math.min(userTotalPages, p + 1))}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hoardings' && (
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-800">Hoarding Management</h2>
                <p className="text-gray-500 mt-1">Manage all hoarding listings</p>
              </div>
              
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <input
                    type="text"
                    placeholder="Search hoardings..."
                    className="border px-4 py-2 rounded-lg flex-1"
                    value={hoardingSearch}
                    onChange={e => setHoardingSearch(e.target.value)}
                  />
                  <select
                    value={hoardingStatusFilter}
                    onChange={e => setHoardingStatusFilter(e.target.value)}
                    className="border px-4 py-2 rounded-lg"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="booked">Booked</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hoarding</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verification</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {hoardings.map(hoarding => (
                        <tr key={hoarding._id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <div className="text-sm font-medium text-gray-900">{hoarding.name}</div>
                            <div className="text-sm text-gray-500">{hoarding.mediaType}</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm text-gray-900">
                              {hoarding.vendorId?.firstName} {hoarding.vendorId?.lastName}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm text-gray-900">{hoarding.location?.city}, {hoarding.location?.state}</div>
                            <div className="text-sm text-gray-500">{hoarding.location?.area}</div>
                          </td>
                          <td className="px-4 py-4">
                            <StatusBadge status={hoarding.status} />
                          </td>
                          <td className="px-4 py-4">
                            <StatusBadge status={hoarding.verification?.status} />
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex gap-2">
                              {hoarding.status === 'pending' && (
                                <>
                                  <button
                                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                                    onClick={() => handleHoardingStatusUpdate(hoarding._id, 'approved')}
                                  >
                                    Approve
                                  </button>
                                  <button
                                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                                    onClick={() => handleHoardingStatusUpdate(hoarding._id, 'rejected')}
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                              <button
                                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                                onClick={() => window.open(`/hoardings/${hoarding._id}`, '_blank')}
                              >
                                View
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {hoardings.length === 0 && (
                  <EmptyState 
                    message="No hoardings found"
                    icon={<Icon path="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" className="w-16 h-16 mx-auto" />}
                  />
                )}

                {/* Pagination */}
                <div className="flex justify-between items-center mt-6">
                  <div className="text-sm text-gray-700">
                    Showing page {hoardingPage} of {hoardingTotalPages}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      className="px-4 py-2 border rounded-lg disabled:opacity-50"
                      disabled={hoardingPage === 1}
                      onClick={() => setHoardingPage(p => Math.max(1, p - 1))}
                    >
                      Previous
                    </button>
                    <button 
                      className="px-4 py-2 border rounded-lg disabled:opacity-50"
                      disabled={hoardingPage === hoardingTotalPages}
                      onClick={() => setHoardingPage(p => Math.min(hoardingTotalPages, p + 1))}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-800">Booking Management</h2>
                <p className="text-gray-500 mt-1">Monitor all booking transactions</p>
              </div>
              
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <input
                    type="text"
                    placeholder="Search bookings..."
                    className="border px-4 py-2 rounded-lg flex-1"
                    value={bookingSearch}
                    onChange={e => setBookingSearch(e.target.value)}
                  />
                  <select
                    value={bookingStatusFilter}
                    onChange={e => setBookingStatusFilter(e.target.value)}
                    className="border px-4 py-2 rounded-lg"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hoarding</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bookings.map(booking => (
                        <tr key={booking._id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <div className="text-sm font-medium text-gray-900">#{booking._id.slice(-6)}</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm font-medium text-gray-900">{booking.hoardingId?.name}</div>
                            <div className="text-sm text-gray-500">{booking.hoardingId?.location?.city}</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm text-gray-900">
                              {booking.buyerId?.firstName} {booking.buyerId?.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{booking.buyerId?.email}</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm text-gray-900">
                              {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm font-medium text-gray-900">₹{booking.totalPrice?.toLocaleString('en-IN')}</div>
                          </td>
                          <td className="px-4 py-4">
                            <StatusBadge status={booking.status} />
                          </td>
                          <td className="px-4 py-4">
                            <button
                              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                              onClick={() => window.open(`/booking/${booking._id}`, '_blank')}
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {bookings.length === 0 && (
                  <EmptyState 
                    message="No bookings found"
                    icon={<Icon path="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" className="w-16 h-16 mx-auto" />}
                  />
                )}

                {/* Pagination */}
                <div className="flex justify-between items-center mt-6">
                  <div className="text-sm text-gray-700">
                    Showing page {bookingPage} of {bookingTotalPages}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      className="px-4 py-2 border rounded-lg disabled:opacity-50"
                      disabled={bookingPage === 1}
                      onClick={() => setBookingPage(p => Math.max(1, p - 1))}
                    >
                      Previous
                    </button>
                    <button 
                      className="px-4 py-2 border rounded-lg disabled:opacity-50"
                      disabled={bookingPage === bookingTotalPages}
                      onClick={() => setBookingPage(p => Math.min(bookingTotalPages, p + 1))}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-800">Review Management</h2>
                <p className="text-gray-500 mt-1">Monitor and manage user reviews</p>
              </div>
              
              <div className="p-6">
                <EmptyState 
                  message="Review management features coming soon"
                  icon={<Icon path="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" className="w-16 h-16 mx-auto" />}
                />
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-800">Advanced Analytics</h2>
                <p className="text-gray-500 mt-1">Detailed platform analytics and insights</p>
              </div>
              
              <div className="p-6">
                <EmptyState 
                  message="Advanced analytics dashboard coming soon"
                  icon={<Icon path="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" className="w-16 h-16 mx-auto" />}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 