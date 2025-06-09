import React, { useEffect, useState } from "react";
import { getMyBookings } from "../api/api";
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";

export default function MyBookings() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    getMyBookings(token).then(res => {
      if (res.bookings) {
        setBookings(res.bookings);
        setError("");
      } else {
        //console.log(res);
        setError(res.message || "Could not fetch bookings");
      }
      setLoading(false);
    });
  }, [token]);

  return (
    <div className="max-w-4xl mx-auto px-2 md:px-0 py-8">
      <h2 className="text-2xl font-bold mb-6">My Bookings</h2>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {!loading && bookings.length === 0 && !error && (
        <div className="text-gray-500">You have no bookings yet.</div>
      )}
      <div className="grid grid-cols-1 gap-6">
        {bookings.map(b => (
          <div key={b._id} className="bg-white rounded shadow flex flex-col md:flex-row gap-4 p-4 items-center">
            <img
              src={b.hoardingId?.image?.url || "/placeholder.jpg"}
              alt={b.hoardingId?.name}
              className="w-32 h-24 object-cover rounded"
            />
            <div className="flex-1 w-full">
              <Link to={`/hoardings/${b.hoardingId?._id || b.hoardingId?.id}`} className="font-semibold text-lg text-blue-700 hover:underline">
                {b.hoardingId?.name || "Hoarding"}
              </Link>
              <div className="text-gray-500 text-sm mb-1">{b.hoardingId?.location?.city}</div>
              <div className="text-gray-700 text-sm">{new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}</div>
              <div className="text-gray-700 text-sm">Total: <span className="font-semibold">₹{b.totalPrice}</span></div>
              <div className="mt-1 flex items-center gap-2">
                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${b.status === "accepted" ? "bg-green-100 text-green-700" : b.status === "pending" ? "bg-yellow-100 text-yellow-700" : b.status === "rejected" ? "bg-red-100 text-red-700" : "bg-gray-200 text-gray-600"}`}>{b.status}</span>
                <Link 
                  to={`/booking/${b._id}`}
                  className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs hover:bg-blue-200 transition"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}