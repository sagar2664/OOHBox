import React from 'react';
import MapTest from '../components/MapTest';

export default function MapTestPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Google Maps API Test Page</h1>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <MapTest />
      </div>
    </div>
  );
} 