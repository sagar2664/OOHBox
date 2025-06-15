import React from "react";
import { Link } from "react-router-dom";

export default function HoardingCard({ hoarding }) {
  const mainMedia = hoarding.media?.[0];

  return (
    <div className="bg-white rounded shadow hover:shadow-lg transition flex flex-col h-full">
      <div className="relative">
        {mainMedia ? (
          mainMedia.mediaType === 'image' ? (
            <img src={mainMedia.url} alt={mainMedia.caption || hoarding.name} className="w-full h-40 object-cover rounded-t" />
          ) : mainMedia.mediaType === 'video' ? (
            <video src={mainMedia.url} className="w-full h-40 object-cover rounded-t" />
          ) : (
            <div className="w-full h-40 bg-gray-100 rounded-t flex items-center justify-center">
              <span className="text-gray-500">360° View</span>
            </div>
          )
        ) : (
          <div className="w-full h-40 bg-gray-100 rounded-t flex items-center justify-center">
            <span className="text-gray-500">No media</span>
          </div>
        )}
        {hoarding.media?.length > 1 && (
          <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
            +{hoarding.media.length - 1} more
          </div>
        )}
        {hoarding.status && (
          <div className="absolute top-2 left-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              hoarding.status === 'approved' ? 'bg-green-100 text-green-800' :
              hoarding.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              hoarding.status === 'rejected' ? 'bg-red-100 text-red-800' :
              hoarding.status === 'booked' ? 'bg-blue-100 text-blue-800' :
              hoarding.status === 'unavailable' ? 'bg-gray-100 text-gray-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {hoarding.status.charAt(0).toUpperCase() + hoarding.status.slice(1)}
            </span>
          </div>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-lg">{hoarding.name}</h3>
        <div className="flex items-center text-gray-500 text-sm mt-1">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
          </svg>
          <span>{hoarding.location?.city}</span>
        </div>
        <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
          <span className="px-2 py-1 bg-gray-100 rounded">{hoarding.mediaType}</span>
          {hoarding.specs?.illumination && (
            <span className="px-2 py-1 bg-gray-100 rounded">{hoarding.specs.illumination}</span>
          )}
        </div>
        <div className="flex items-center justify-between mt-2">
          <div>
            <span className="text-blue-600 font-bold">
              ₹{hoarding.pricing?.basePrice}
              <span className="text-xs text-gray-500">/{hoarding.pricing?.per}</span>
            </span>
            {hoarding.pricing?.negotiable && (
              <span className="text-xs text-gray-500 ml-1">(Negotiable)</span>
            )}
          </div>
          <span className="flex items-center gap-1 text-yellow-500 text-sm">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.564-.955L10 0l2.948 5.955 6.564.955-4.756 4.635 1.122 6.545z"/>
            </svg>
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