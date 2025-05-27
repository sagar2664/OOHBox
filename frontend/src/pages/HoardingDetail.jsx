import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getHoardingById, getHoardingReviews } from "../api/api";

export default function HoardingDetail() {
  const { id } = useParams();
  const [hoarding, setHoarding] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

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
            <button className="bg-blue-600 text-white px-6 py-2 rounded font-semibold w-full">Book Now</button>
            <div className="text-xs text-gray-400 mt-2">Secure Booking</div>
          </div>
          {/* Location Box */}
          <div className="bg-white rounded shadow p-4 text-sm">
            <div className="font-semibold mb-1">Location</div>
            <div>{hoarding.location?.address}</div>
            <div>{hoarding.location?.city}, {hoarding.location?.state}</div>
          </div>
        </div>
      </div>
      {/* Availability Calendar Placeholder */}
      <div className="bg-white rounded shadow p-4 mt-8 mb-6">
        <div className="font-semibold mb-2">Availability Calendar</div>
        <div className="h-24 flex items-center justify-center text-gray-400">[Calendar Placeholder]</div>
      </div>
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