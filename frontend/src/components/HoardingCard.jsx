import React from "react";
import { Link } from "react-router-dom";

export default function HoardingCard({ hoarding }) {
  const mainMedia = hoarding.media?.[0];

  return (
    // Added 'group' for hover effects on child elements
    <div className="bg-white rounded-lg shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col h-full group overflow-hidden">
      <div className="relative">
        <div className="w-full h-48 overflow-hidden">
        {mainMedia ? (
          <img 
            src={mainMedia.url} 
            alt={mainMedia.caption || hoarding.name} 
            className="w-full h-full object-cover rounded-t-lg transition-transform duration-500 group-hover:scale-110" 
          />
        ) : (
          <div className="w-full h-48 bg-gray-100 rounded-t flex items-center justify-center">
            <span className="text-gray-500">No media</span>
          </div>
        )}
        </div>
        {/* Status Badge */}
        {hoarding.status === 'approved' && (
           <div className="absolute top-3 left-3 bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">Available</div>
        )}
        {hoarding.status === 'booked' && (
           <div className="absolute top-3 left-3 bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">Booked</div>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <p className="text-sm text-gray-500 flex items-center">
          <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
          {hoarding.location?.city}, {hoarding.location?.state}
        </p>
        <h3 className="font-bold text-xl mt-1 text-gray-800 group-hover:text-blue-600 transition-colors">{hoarding.name}</h3>
        
        <div className="mt-4 flex items-center justify-between">
          <div>
            <span className="text-xl font-bold text-blue-600">
              ₹{hoarding.pricing?.basePrice.toLocaleString('en-IN')}
            </span>
            <span className="text-sm text-gray-500">/{hoarding.pricing?.per || 'month'}</span>
          </div>
          <div className="flex items-center gap-1 text-yellow-500 text-sm font-bold">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
            <span>{hoarding.averageRating?.toFixed(1) || "New"}</span>
          </div>
        </div>

        <div className="mt-auto pt-4">
          <Link
            to={`/hoardings/${hoarding.id || hoarding._id}`}
            className="block w-full bg-blue-50 text-blue-600 text-center py-2.5 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}