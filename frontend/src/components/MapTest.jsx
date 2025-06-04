import React from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px'
};

const center = {
  lat: 20.5937, // India's center
  lng: 78.9629
};

const MapTest = () => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  if (loadError) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded">
        <h3 className="font-bold">Error Loading Maps</h3>
        <p>Error: {loadError.message}</p>
        <p className="mt-2">Please check:</p>
        <ul className="list-disc list-inside mt-1">
          <li>Your API key is correctly set in .env file</li>
          <li>The Maps JavaScript API is enabled in Google Cloud Console</li>
          <li>Your domain restrictions are properly set</li>
        </ul>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="p-4 bg-blue-100 text-blue-700 rounded">
        <p>Loading Maps...</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Google Maps Test</h2>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={5}
          options={{
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
          }}
        >
          <Marker position={center} />
        </GoogleMap>
      </div>
      <div className="mt-4 p-4 bg-green-100 text-green-700 rounded">
        <p className="font-bold">✅ Maps API is working correctly!</p>
        <p className="mt-2">Your API key is valid and the map is loading properly.</p>
      </div>
    </div>
  );
};

export default MapTest; 