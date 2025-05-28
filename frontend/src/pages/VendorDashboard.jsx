import React, { useEffect, useState } from "react";
import { getVendorHoardings, getVendorBookings } from "../api/api";
import { useAuth } from "../hooks/useAuth";

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

export default function VendorDashboard() {
  const { token } = useAuth();
  const [hoardings, setHoardings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setLoading(true);
    Promise.all([
      getVendorHoardings(token),
      getVendorBookings(token)
    ]).then(([hRes, bRes]) => {
      setHoardings(hRes.hoardings || []);
      setBookings(bRes.bookings || []);
      setLoading(false);
    });
  }, [token]);

  //console.log(token);

  // Split bookings
  const bookingRequests = bookings.filter(b => b.status === "pending");
  const completedProofPending = bookings.filter(b => b.status === "completed" && !b.proofImage?.url);

  return (
    <div className="max-w-6xl mx-auto py-8 px-2 md:px-0">
      <h1 className="text-2xl font-bold mb-6">Vendor Dashboard</h1>
      {/* Owned Hoardings */}
      <div className="bg-white rounded shadow p-4 mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-semibold text-lg">Owned Hoardings</h2>
          <button className="bg-blue-600 text-white px-4 py-1 rounded text-sm font-semibold">+ Add New Hoarding</button>
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
                  <td className="px-3 py-2">₹{h.price?.toLocaleString()}/mo</td>
                  <td className="px-3 py-2">{h.averageRating?.toFixed(1) || "-"} <span className="text-yellow-500">★</span></td>
                  <td className="px-3 py-2">{h.reviewCount || 0}</td>
                  <td className="px-3 py-2 flex gap-2">
                    <button className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">View Details</button>
                    <button className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">✎</button>
                    <button className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">🗑</button>
                  </td>
                </tr>
              ))}
              {hoardings.length === 0 && <tr><td colSpan={6} className="text-center py-4 text-gray-400">No hoardings found.</td></tr>}
            </tbody>
          </table>
        </div>
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
                  <td className="px-3 py-2">{b.buyerId?.username || b.buyerId?.firstName || "-"}</td>
                  <td className="px-3 py-2">{b.hoardingId?.name || "-"}</td>
                  <td className="px-3 py-2">{new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}</td>
                  <td className="px-3 py-2"><StatusBadge status={b.status} /></td>
                  <td className="px-3 py-2">
                    <button className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">View Details</button>
                  </td>
                </tr>
              ))}
              {bookingRequests.length === 0 && <tr><td colSpan={5} className="text-center py-4 text-gray-400">No booking requests.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      {/* Completed Bookings - Proof Pending */}
      <div className="bg-white rounded shadow p-4 mb-8">
        <h2 className="font-semibold text-lg mb-2">Completed Bookings - Proof Pending</h2>
        <div className="flex flex-col gap-3">
          {completedProofPending.map(b => (
            <div key={b._id} className="flex flex-col md:flex-row md:items-center justify-between bg-blue-50 rounded p-3">
              <div>
                <div className="font-semibold">{b.hoardingId?.name || "-"}</div>
                <div className="text-xs text-gray-500">{new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}</div>
              </div>
              <div className="flex items-center gap-2 mt-2 md:mt-0">
                <StatusBadge status="Proof Overdue" />
                <button className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">View Details</button>
              </div>
            </div>
          ))}
          {completedProofPending.length === 0 && <div className="text-center text-gray-400 py-4">No completed bookings pending proof.</div>}
        </div>
      </div>
    </div>
  );
} 