import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getHoardingById, getHoardingReviews, createBooking } from "../api/api";
import { useAuth } from "../hooks/useAuth";

export default function HoardingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hoarding, setHoarding] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);
  const [bookingForm, setBookingForm] = useState({ startDate: "", endDate: "", notes: "" });
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const { user, token } = useAuth();

  useEffect(() => {
    setLoading(true);
    getHoardingById(id).then(data => {
      setHoarding(data);
      setLoading(false);
    });
    getHoardingReviews(id, { limit: 2 }).then(data => {
      setReviews(data.reviews || []);
    });
  }, [id]);

  const handleBookingChange = e => setBookingForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleBookingSubmit = async e => {
    e.preventDefault();
    setBookingError("");
    setBookingSuccess("");
    setBookingLoading(true);
    const res = await createBooking({
      hoardingId: id,
      startDate: bookingForm.startDate,
      endDate: bookingForm.endDate,
      notes: bookingForm.notes,
    }, token);
    setBookingLoading(false);
    if (res.booking) {
      setShowBooking(false);
      setBookingForm({ startDate: "", endDate: "", notes: "" });
      navigate("/my-bookings");
    } else {
      setBookingError(res.message || (res.errors && res.errors[0]?.msg) || "Booking failed");
    }
  };

  if (loading || !hoarding) {
    return <div className="flex justify-center items-center min-h-[60vh]">Loading...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-2 md:px-0 py-8">
      {/* Image Carousel (single image for now) */}
      <div className="w-full h-56 md:h-72 bg-gray-100 rounded-lg overflow-hidden mb-6 flex items-center justify-center">
        <img src={hoarding.image?.url || "/placeholder.jpg"} alt={hoarding.name} className="object-cover w-full h-full" />
      </div>
      {/* Main Info */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{hoarding.name}</h1>
          <div className="flex items-center text-gray-500 mb-2">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" /></svg>
            <span>{hoarding.location?.address}, {hoarding.location?.city}, {hoarding.location?.state}</span>
          </div>
          <p className="text-gray-700 mb-4">{hoarding.description}</p>
          {/* Specs Table */}
          <div className="bg-white rounded shadow p-4 mb-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              <div><span className="font-semibold">Type:</span> {hoarding.specs?.type}</div>
              <div><span className="font-semibold">Width:</span> {hoarding.specs?.width} ft</div>
              <div><span className="font-semibold">Height:</span> {hoarding.specs?.height} ft</div>
              {/* Add more specs if available */}
            </div>
          </div>
        </div>
        {/* Price & Book */}
        <div className="w-full md:w-72 flex-shrink-0">
          <div className="bg-white rounded shadow p-6 mb-4 flex flex-col items-center">
            <div className="text-gray-500 text-sm mb-1">Daily Rental</div>
            <div className="text-2xl font-bold text-blue-600 mb-4">₹{hoarding.price} <span className="text-base text-gray-500">/day</span></div>
            {user && user.role === "buyer" ? (
              <button className="bg-blue-600 text-white px-6 py-2 rounded font-semibold w-full" onClick={() => setShowBooking(true)}>
                Book Now
              </button>
            ) : (
              <button className="bg-gray-300 text-gray-500 px-6 py-2 rounded font-semibold w-full cursor-not-allowed" disabled>
                Login as Buyer to Book
              </button>
            )}
            <div className="text-xs text-gray-400 mt-2">Secure Booking</div>
          </div>
          {/* Location Box */}
          <div className="bg-white rounded shadow p-4 text-sm">
            <div className="font-semibold mb-1">Location</div>
            <div>{hoarding.location?.address}</div>
            <div>{hoarding.location?.city}, {hoarding.location?.state}</div>
          </div>
          {/* Vendor Contact */}
          <div className="bg-white rounded shadow p-4 text-sm mt-4">
            <div className="font-semibold mb-1">Vendor Contact</div>
            <div>Email: <a href={`mailto:${hoarding.vendorId?.email}`} className="text-blue-600">{hoarding.vendorId?.email}</a></div>
            <div>Phone: <a href={`tel:${hoarding.vendorId?.phoneNumber}`} className="text-blue-600">{hoarding.vendorId?.phoneNumber}</a></div>
          </div>
        </div>
      </div>
      {/* Booking Modal */}
      {showBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setShowBooking(false)}>&times;</button>
            <h3 className="text-xl font-bold mb-4">Book Hoarding</h3>
            {bookingError && <div className="text-red-500 mb-2">{bookingError}</div>}
            {bookingSuccess && <div className="text-green-600 mb-2">{bookingSuccess}</div>}
            <form onSubmit={handleBookingSubmit} className="flex flex-col gap-3">
              <label className="text-sm font-medium">Start Date
                <input type="date" name="startDate" value={bookingForm.startDate} onChange={handleBookingChange} className="border rounded px-3 py-2 w-full mt-1" required />
              </label>
              <label className="text-sm font-medium">End Date
                <input type="date" name="endDate" value={bookingForm.endDate} onChange={handleBookingChange} className="border rounded px-3 py-2 w-full mt-1" required />
              </label>
              <label className="text-sm font-medium">Notes (optional)
                <textarea name="notes" value={bookingForm.notes} onChange={handleBookingChange} className="border rounded px-3 py-2 w-full mt-1" maxLength={500} rows={2} />
              </label>
              <button className="bg-blue-600 text-white py-2 rounded font-semibold mt-2" disabled={bookingLoading}>{bookingLoading ? "Booking..." : "Confirm Booking"}</button>
            </form>
          </div>
        </div>
      )}
      {/* Reviews */}
      <div className="bg-white rounded shadow p-4 mb-6">
        <div className="flex items-center mb-2">
          <span className="text-xl font-bold text-yellow-500 mr-2">{hoarding.averageRating?.toFixed(1) || "-"}</span>
          <span className="text-gray-700 font-semibold">({hoarding.reviewCount || 0} reviews)</span>
        </div>
        <div className="flex flex-col gap-4">
          {reviews.length === 0 && <div className="text-gray-400">No reviews yet.</div>}
          {reviews.map(r => (
            <div key={r._id} className="flex gap-3 items-start">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-lg text-gray-600">
                {r.buyerId?.firstName?.[0] || "U"}
              </div>
              <div>
                <div className="font-semibold text-gray-800 flex items-center gap-2">{r.buyerId?.firstName || "User"}
                  <span className="text-yellow-500 flex items-center ml-2">{Array(r.rating).fill(0).map((_, i) => <svg key={i} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.564-.955L10 0l2.948 5.955 6.564.955-4.756 4.635 1.122 6.545z"/></svg>)}</span>
                </div>
                <div className="text-gray-600 text-sm mb-1">{new Date(r.createdAt).toLocaleDateString()}</div>
                <div className="text-gray-700">{r.comment}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}