import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px', // Increased height for better usability with the search bar
};

const defaultCenter = {
  lat: 20.5937, // Center of India
  lng: 78.9629,
};

// Move libraries array outside the component to avoid performance warning
const LIBRARIES = ['places'];

const LocationPickerMap = ({ value, onChange, disabled }) => {
  const [marker, setMarker] = useState(value || null);
  const [address, setAddress] = useState('');
  
  const mapRef = useRef(null);
  const autocompleteRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  // Effect to set initial center based on user's location
  useEffect(() => {
    // Only try to geolocate if no initial value is provided
    if (!value && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (mapRef.current) {
            mapRef.current.panTo({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
            mapRef.current.setZoom(12);
          }
        },
        () => {
          // Geolocation failed or was denied, falls back to default center
        }
      );
    }
  }, [value, isLoaded]);

  // Unified function to update location, marker, and address
  const updateLocation = useCallback((latLng) => {
    if (disabled) return;

    const coords = {
      lat: latLng.lat(),
      lng: latLng.lng(),
    };
    
    setMarker(coords);
    if (onChange) onChange(coords);

    // Reverse Geocode to get the address
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: coords }, (results, status) => {
      if (status === 'OK' && results[0]) {
        setAddress(results[0].formatted_address);
      } else {
        setAddress('Address not found');
      }
    });
  }, [onChange, disabled]);

  // Handler for when a place is selected from the Autocomplete dropdown
  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry && place.geometry.location) {
        if (mapRef.current) mapRef.current.panTo(place.geometry.location);
        updateLocation(place.geometry.location);
      }
    }
  };
  
  const handleClearLocation = () => {
      setMarker(null);
      setAddress('');
      if (onChange) onChange(null);
  };

  if (loadError) {
    return <div>Error loading map. Please check your API key.</div>;
  }

  if (!isLoaded) {
    return <div className="w-full h-[400px] bg-gray-100 flex items-center justify-center">Loading map...</div>;
  }

  return (
    <div className="w-full">
      {/* Autocomplete Search Bar */}
      {!disabled && (
        <Autocomplete
          onLoad={(ref) => (autocompleteRef.current = ref)}
          onPlaceChanged={onPlaceChanged}
        >
          <input
            type="text"
            placeholder="Search for a location..."
            className="w-full px-4 py-2 mb-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </Autocomplete>
      )}

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={marker || defaultCenter}
        zoom={marker ? 15 : 5}
        onClick={(e) => updateLocation(e.latLng)}
        onLoad={(map) => (mapRef.current = map)}
        options={{
          clickableIcons: !disabled,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
        }}
      >
        {marker && (
          <Marker
            position={marker}
            draggable={!disabled}
            onDragEnd={(e) => updateLocation(e.latLng)}
            // Removed broken icon URL to use the default, more reliable marker
          />
        )}
      </GoogleMap>
      
      {/* Display selected location info and clear button */}
      <div className="flex items-center justify-between mt-2 text-sm text-gray-700">
        {marker ? (
            <div className="flex-grow">
                <p className="font-semibold">Selected Location:</p>
                <p className="text-gray-600">
                  {address ||
                    (marker && typeof marker.lat === 'number' && typeof marker.lng === 'number'
                      ? `Lat: ${marker.lat.toFixed(6)}, Lng: ${marker.lng.toFixed(6)}`
                      : 'Invalid coordinates')}
                </p>
            </div>
        ) : (
          <span className="text-gray-400">Click on the map or search to select a location.</span>
        )}
        {marker && !disabled && (
            <button
                onClick={handleClearLocation}
                className="px-3 py-1 text-sm text-red-600 bg-red-100 rounded hover:bg-red-200"
            >
                Clear
            </button>
        )}
      </div>
    </div>
  );
};

export default LocationPickerMap;