import React, { useEffect, useState } from "react";
import { getVendorHoardings, getVendorBookings, updateBookingStatus, updateInstallation } from "../api/api";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

function StatusBadge({ status }) {
  const map = {
    active: "bg-blue-100 text-blue-700",
    pending: "bg-yellow-100 text-yellow-700",
    inactive: "bg-red-100 text-red-700",
    accepted: "bg-green-100 text-green-700",
    declined: "bg-red-100 text-red-700",
    rejected: "bg-red-100 text-red-700",
    completed: "bg-gray-100 text-gray-700",
    proof_pending: "bg-orange-100 text-orange-700",
    awaiting_upload: "bg-blue-100 text-blue-700",
  };
  return <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${map[status?.toLowerCase()] || "bg-gray-200 text-gray-600"}`}>{status?.charAt(0).toUpperCase() + status?.slice(1)}</span>;
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  return (
    <div className="flex justify-center items-center gap-2 mt-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded bg-gray-100 disabled:opacity-50"
      >
        Previous
      </button>
      <span className="text-sm">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded bg-gray-100 disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}

export default function VendorDashboard() {
  const { token, loading: authLoading } = useAuth();
  const [hoardings, setHoardings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination states
  const [hoardingsPage, setHoardingsPage] = useState(1);
  const [bookingsPage, setBookingsPage] = useState(1);
  const [completedPage, setCompletedPage] = useState(1);
  const [totalHoardingsPages, setTotalHoardingsPages] = useState(1);
  const [totalBookingsPages, setTotalBookingsPages] = useState(1);
  const [totalCompletedPages, setTotalCompletedPages] = useState(1);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Only make the API call if we have a token and auth is not loading
    if (!authLoading && token) {
      //console.log('Making API calls with token:', token);
      setLoading(true);
      setError(null);
      
      Promise.all([
        getVendorHoardings(token, { page: hoardingsPage }).catch(err => {
          //console.error('Error fetching hoardings:', err);
          setError(err.message);
          return { hoardings: [], totalPages: 1 };
        }),
        getVendorBookings(token, { page: bookingsPage }).catch(err => {
          //console.error('Error fetching bookings:', err);
          return { bookings: [], totalPages: 1 };
        })
      ]).then(([hRes, bRes]) => {
        //console.log('Hoardings response:', hRes);
        setHoardings(hRes.hoardings || []);
        setBookings(bRes.bookings || []);
        setTotalHoardingsPages(hRes.totalPages || 1);
        setTotalBookingsPages(bRes.totalPages || 1);
        setLoading(false);
      });
    }
  }, [token, authLoading, hoardingsPage, bookingsPage]);

  const handleBookingAction = async (bookingId, status) => {
    try {
      await updateBookingStatus(bookingId, status, token);
      // Refresh bookings after status update
      const updatedBookings = await getVendorBookings(token, { page: bookingsPage });
      setBookings(updatedBookings.bookings || []);
    } catch (error) {
      console.error('Error updating booking status:', error);
      // Handle error (show error message to user)
    }
  };

  const handleInstallationAction = async (bookingId, status) => {
    try {
      const installationData = {
        status,
        ...(status === 'Scheduled' && { scheduledDate: new Date().toISOString() }),
        ...(status === 'Completed' && { completedDate: new Date().toISOString() })
      };
      
      await updateInstallation(bookingId, installationData, token);
      // Refresh bookings after installation update
      const updatedBookings = await getVendorBookings(token, { page: bookingsPage });
      setBookings(updatedBookings.bookings || []);
    } catch (error) {
      console.error('Error updating installation status:', error);
      // Handle error (show error message to user)
    }
  };

  // Show loading state while auth is loading or data is being fetched
  if (authLoading || loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  // Show error if there is one
  if (error) {
    return <div className="text-center py-8 text-red-600">Error: {error}</div>;
  }

  // Show message if not logged in
  if (!token) {
    return <div className="text-center py-8 text-red-600">Please log in to view your dashboard.</div>;
  }

  // Split bookings
  const bookingRequests = bookings.filter(b => b.status != "completed");
  const completedProofPending = bookings.filter(b => b.status === "completed" && !b.proofImage?.url);

  return (
    <div className="max-w-6xl mx-auto py-8 px-2 md:px-0">
      <h1 className="text-2xl font-bold mb-6">Vendor Dashboard</h1>
      {/* Owned Hoardings */}
      <div className="bg-white rounded shadow p-4 mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-semibold text-lg">Owned Hoardings</h2>
          <button className="bg-blue-600 text-white px-4 py-1 rounded text-sm font-semibold" onClick={() => navigate('/add-hoarding')}>+ Add New Hoarding</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Price</th>
                <th className="px-3 py-2 text-left">Avg Rating</th>
                <th className="px-3 py-2 text-left">Reviews</th>
                <th className="px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {hoardings.map(h => (
                <tr key={h._id} className="border-b">
                  <td className="px-3 py-2">{h.name}</td>
                  <td className="px-3 py-2"><StatusBadge status={h.status} /></td>
                  <td className="px-3 py-2">₹{h.pricing?.basePrice.toLocaleString('en-IN')}/{h.pricing?.per || 'month'}</td>
                  <td className="px-3 py-2">{h.averageRating?.toFixed(1) || "-"} <span className="text-yellow-500">★</span></td>
                  <td className="px-3 py-2">{h.reviewCount || 0}</td>
                  <td className="px-3 py-2 flex gap-2">
                    <button className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs" onClick={() => navigate(`/hoardings/${h._id}`)}>View Details</button>
                    <button className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs" onClick={() => navigate(`/edit-hoarding/${h._id}`)}>✎</button>
                    <button className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">🗑</button>
                  </td>
                </tr>
              ))}
              {hoardings.length === 0 && <tr><td colSpan={6} className="text-center py-4 text-gray-400">No hoardings found.</td></tr>}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={hoardingsPage}
          totalPages={totalHoardingsPages}
          onPageChange={setHoardingsPage}
        />
      </div>
      {/* Booking Requests */}
      <div className="bg-white rounded shadow p-4 mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-semibold text-lg">Booking Requests</h2>
          <span className="text-xs text-blue-600 font-semibold">{bookingRequests.length} New Requests</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left">Buyer Name</th>
                <th className="px-3 py-2 text-left">Hoarding Name</th>
                <th className="px-3 py-2 text-left">Dates</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookingRequests.map(b => (
                <tr key={b._id} className="border-b">
                  <td className="px-3 py-2">{b.buyerId?.firstName} {b.buyerId?.lastName}</td>
                  <td className="px-3 py-2">{b.hoardingId?.name || "-"}</td>
                  <td className="px-3 py-2">{new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}</td>
                  <td className="px-3 py-2"><StatusBadge status={b.status} /></td>
                  <td className="px-3 py-2">
                    <button 
                      className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs hover:bg-blue-200 transition" 
                      onClick={() => navigate(`/booking/${b._id}`)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
              {bookingRequests.length === 0 && <tr><td colSpan={5} className="text-center py-4 text-gray-400">No booking requests.</td></tr>}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={bookingsPage}
          totalPages={totalBookingsPages}
          onPageChange={setBookingsPage}
        />
      </div>
      {/* Completed Bookings - Proof Pending */}
      <div className="bg-white rounded shadow p-4 mb-8">
        <h2 className="font-semibold text-lg mb-2">Completed Bookings</h2>
        <div className="flex flex-col gap-3">
          {bookings.filter(b => b.status === 'completed').map(b => (
            <div key={b._id} className="flex flex-col md:flex-row md:items-center justify-between bg-blue-50 rounded p-3">
              <div>
                <div className="font-semibold">{b.hoardingId?.name || "-"}</div>
                <div className="text-xs text-gray-500">{new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}</div>
              </div>
              <div className="flex items-center gap-2 mt-2 md:mt-0">
                <StatusBadge status={b.proofImage?.url ? "Completed" : "Proof Pending"} />
                <button 
                  className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs"
                  onClick={() => navigate(`/booking/${b._id}`)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
          {bookings.filter(b => b.status === 'completed').length === 0 && <div className="text-center text-gray-400 py-4">No completed bookings.</div>}
        </div>
        <Pagination
          currentPage={completedPage}
          totalPages={totalCompletedPages}
          onPageChange={setCompletedPage}
        />
      </div>
      {/* Bookings Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Booking Requests</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookings.map(booking => (
            <div key={booking._id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium">{booking.hoardingId?.name}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    booking.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                    booking.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                    booking.verification?.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                    booking.verification?.status === 'Verified' ? 'bg-green-100 text-green-700' :
                    booking.verification?.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {booking.verification?.status || 'Pending'}
                  </span>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                    booking.installation?.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                    booking.installation?.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' :
                    booking.installation?.status === 'Completed' ? 'bg-green-100 text-green-700' :
                    booking.installation?.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {booking.installation?.status || 'Pending'}
                  </span>
                </div>
              </div>
              <div className="text-sm mb-3">
                <div>Price: ₹{booking.pricing?.basePrice != null ? booking.pricing.basePrice.toLocaleString('en-IN') : '--'}/{booking.pricing?.per || '--'}</div>
                <div>Total: ₹{booking.pricing?.totalPrice != null ? booking.pricing.totalPrice.toLocaleString('en-IN') : '--'}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  to={`/bookings/${booking._id}`}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  View Details
                </Link>
                {booking.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleBookingAction(booking._id, 'accepted')}
                      className="text-sm text-green-600 hover:text-green-800"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleBookingAction(booking._id, 'rejected')}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Reject
                    </button>
                  </>
                )}
                {booking.status === 'accepted' && (
                  <>
                    <button
                      onClick={() => handleBookingAction(booking._id, 'completed')}
                      className="text-sm text-green-600 hover:text-green-800"
                    >
                      Mark as Completed
                    </button>
                    <button
                      onClick={() => handleBookingAction(booking._id, 'cancelled')}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Cancel
                    </button>
                  </>
                )}
                {booking.status === 'accepted' && booking.installation?.status === 'Pending' && (
                  <button
                    onClick={() => handleInstallationAction(booking._id, 'Scheduled')}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Schedule Installation
                  </button>
                )}
                {booking.status === 'accepted' && booking.installation?.status === 'Scheduled' && (
                  <button
                    onClick={() => handleInstallationAction(booking._id, 'Completed')}
                    className="text-sm text-green-600 hover:text-green-800"
                  >
                    Mark Installation Complete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 