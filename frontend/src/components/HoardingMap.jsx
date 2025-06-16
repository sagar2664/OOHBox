import React, { useCallback, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Link } from 'react-router-dom';

const containerStyle = {
  width: '100%',
  height: '400px'
};

const defaultCenter = {
  lat: 20.5937, // India's center
  lng: 78.9629
};

const isValidCoordinate = (coord) => {
  return typeof coord === 'number' && !isNaN(coord);
};

const parseCoordinates = (coordinates) => {
  if (!coordinates) return null;

  // Handle different possible coordinate formats
  let lat, lng;

  // Format 1: { latitude: number, longitude: number }
  if (coordinates.latitude !== undefined && coordinates.longitude !== undefined) {
    lat = parseFloat(coordinates.latitude);
    lng = parseFloat(coordinates.longitude);
  }
  // Format 2: { lat: number, lng: number }
  else if (coordinates.lat !== undefined && coordinates.lng !== undefined) {
    lat = parseFloat(coordinates.lat);
    lng = parseFloat(coordinates.lng);
  }
  // Format 3: [longitude, latitude] array
  else if (Array.isArray(coordinates) && coordinates.length === 2) {
    lat = parseFloat(coordinates[1]);
    lng = parseFloat(coordinates[0]);
  }
  // Format 4: { coordinates: [longitude, latitude] }
  else if (coordinates.coordinates && Array.isArray(coordinates.coordinates) && coordinates.coordinates.length === 2) {
    lat = parseFloat(coordinates.coordinates[1]);
    lng = parseFloat(coordinates.coordinates[0]);
  }

  if (isValidCoordinate(lat) && isValidCoordinate(lng)) {
    return { lat, lng };
  }

  return null;
};

const HoardingMap = ({ hoardings = [] }) => {
  const [selectedHoarding, setSelectedHoarding] = useState(null);
  const [map, setMap] = useState(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  const onLoad = useCallback(function callback(map) {
    if (hoardings.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      let validPoints = 0;

      hoardings.forEach(hoarding => {
        const coords = parseCoordinates(hoarding.location?.coordinates);
        if (coords) {
          bounds.extend(coords);
          validPoints++;
        }
      });

      if (validPoints > 0) {
        if (bounds.getNorthEast().equals(bounds.getSouthWest())) {
          // If all points are the same, zoom out
          map.setCenter(defaultCenter);
          map.setZoom(5);
        } else {
          map.fitBounds(bounds);
        }
      } else {
        map.setCenter(defaultCenter);
        map.setZoom(5);
      }
    } else {
      map.setCenter(defaultCenter);
      map.setZoom(5);
    }
    setMap(map);
  }, [hoardings]);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  if (!isLoaded) {
    return <div className="w-full h-[400px] bg-gray-100 flex items-center justify-center">Loading map...</div>;
  }

  return (
    <div className="w-full rounded-lg overflow-hidden shadow-lg">
      <GoogleMap
        mapContainerStyle={containerStyle}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
        }}
      >
        {hoardings.map((hoarding) => {
          const coords = parseCoordinates(hoarding.location?.coordinates);
          if (!coords) {
            console.warn('Invalid coordinates for hoarding:', hoarding._id, hoarding.location?.coordinates);
            return null;
          }
          
          return (
            <Marker
              key={hoarding._id}
              position={coords}
              onClick={() => setSelectedHoarding(hoarding)}
              icon={{
                url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
              }}
            />
          );
        })}

        {selectedHoarding && selectedHoarding.location?.coordinates && (
          <InfoWindow
            position={parseCoordinates(selectedHoarding.location.coordinates)}
            onCloseClick={() => setSelectedHoarding(null)}
          >
            <div className="p-2 min-w-[200px]">
              <h3 className="font-semibold text-lg mb-1">{selectedHoarding.name}</h3>
              <p className="text-sm text-gray-600 mb-1">{selectedHoarding.location.address}</p>
              <p className="text-sm font-medium text-blue-600 mb-2">
                ₹{selectedHoarding.pricing?.basePrice.toLocaleString('en-IN')}/{selectedHoarding.pricing?.per || 'month'}
              </p>
              <Link
                to={`/hoardings/${selectedHoarding._id}`}
                className="block w-full bg-blue-600 text-white text-center py-1.5 px-3 rounded text-sm font-medium hover:bg-blue-700 transition"
                onClick={() => setSelectedHoarding(null)}
              >
                View Details
              </Link>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

export default HoardingMap; 