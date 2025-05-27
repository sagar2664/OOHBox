import React from "react";
import { Link } from "react-router-dom";
export default function HoardingCard({ hoarding }) {
  return (
    <div className="bg-white rounded shadow hover:shadow-lg transition flex flex-col h-full">
      <img src={hoarding.image?.url || "/placeholder.jpg"} alt={hoarding.name} className="w-full h-40 object-cover rounded-t" />
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-lg">{hoarding.name}</h3>
        <p className="text-gray-500">{hoarding.location?.city}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-blue-600 font-bold">${hoarding.price} <span className="text-xs text-gray-500">/day</span></span>
          <span className="flex items-center gap-1 text-yellow-500 text-sm">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.564-.955L10 0l2.948 5.955 6.564.955-4.756 4.635 1.122 6.545z"/></svg>
            {hoarding.averageRating?.toFixed(1) || "0.0"}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1">{hoarding.reviewCount} reviews</p>
        <div className="mt-4">
          <Link
            to={`/hoardings/${hoarding.id || hoarding._id}`}
            className="block w-full bg-blue-600 text-white text-center py-2 rounded font-semibold hover:bg-blue-700 transition"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}