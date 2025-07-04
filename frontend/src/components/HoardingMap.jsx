import React, { useCallback, useRef, useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Autocomplete } from '@react-google-maps/api';
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

// Custom AdvancedMarker component
const AdvancedMarker = ({ position, map, onClick, icon, hoarding }) => {
  const markerRef = useRef(null);

  useEffect(() => {
    if (!map || !window.google || !window.google.maps || !window.google.maps.marker) return;
    const { AdvancedMarkerElement } = window.google.maps.marker;
    if (!AdvancedMarkerElement) return;

    const marker = new AdvancedMarkerElement({
      map,
      position,
      title: hoarding?.name || '',
      ...(icon ? { content: (() => {
        const img = document.createElement('img');
        img.src = icon.url;
        img.style.width = '32px';
        img.style.height = '32px';
        return img;
      })() } : {})
    });
    if (onClick) {
      marker.addListener('click', () => onClick());
    }
    markerRef.current = marker;
    return () => {
      marker.map = null;
      marker.remove();
    };
  }, [map, position, onClick, icon, hoarding]);

  return null;
};

const LIBRARIES = ['places'];

const HoardingMap = ({ hoardings = [] }) => {
  const [selectedHoarding, setSelectedHoarding] = useState(null);
  const [map, setMap] = useState(null);
  const [autocomplete, setAutocomplete] = useState(null);
  const [searchMarker, setSearchMarker] = useState(null);
  const [searchLocation, setSearchLocation] = useState(null);
  const searchInputRef = useRef(null);
  console.log(hoardings);
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  // Haversine formula to calculate distance between two lat/lng points in km
  function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Filter hoardings within 40km of search location
  let filteredHoardings = hoardings;
  if (searchLocation) {
    filteredHoardings = hoardings.filter((hoarding) => {
      const coords = parseCoordinates(hoarding.location?.coordinates);
      if (!coords) return false;
      const dist = getDistanceFromLatLonInKm(
        searchLocation.lat,
        searchLocation.lng,
        coords.lat,
        coords.lng
      );
      return dist <= 40;
    });
  }

  const onLoad = useCallback(
    function callback(map) {
      const hoardingsToShow = searchLocation ? filteredHoardings : hoardings;
      if (hoardingsToShow.length > 0) {
        const bounds = new window.google.maps.LatLngBounds();
        let validPoints = 0;
        hoardingsToShow.forEach((hoarding) => {
          const coords = parseCoordinates(hoarding.location?.coordinates);
          if (coords) {
            bounds.extend(coords);
            validPoints++;
          } else {
            console.warn('Invalid coordinates for hoarding:', hoarding._id, hoarding.location?.coordinates);
          }
        });
        if (validPoints > 0) {
          if (bounds.getNorthEast().equals(bounds.getSouthWest())) {
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
    },
    [hoardings, filteredHoardings, searchLocation]
  );

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  // Handle place selection from autocomplete
  const onPlaceChanged = () => {
    if (autocomplete && map) {
      const place = autocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        const location = place.geometry.location;
        const latLng = { lat: location.lat(), lng: location.lng() };
        map.panTo(latLng);
        map.setZoom(14);
        setSearchMarker(latLng);
        setSearchLocation(latLng);
      }
    }
  };

  if (!isLoaded) {
    return <div className="w-full h-[400px] bg-gray-100 flex items-center justify-center">Loading map...</div>;
  }

  return (
    <div className="w-full rounded-lg overflow-hidden shadow-lg">
      {/* Search Bar */}
      <div className="w-full flex justify-center p-2 bg-white z-10">
        <div className="relative w-full max-w-md">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {/* Search Icon SVG */}
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
            </svg>
          </span>
          <Autocomplete onLoad={setAutocomplete} onPlaceChanged={onPlaceChanged}>
            <input
              type="text"
              placeholder="Search for a place..."
              ref={searchInputRef}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-full shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition placeholder-gray-400 text-base hover:border-blue-400"
              style={{ fontSize: '16px' }}
            />
          </Autocomplete>
        </div>
      </div>
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
        {/* Marker for searched place */}
        {searchMarker && (
          <Marker
            position={searchMarker}
            icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' }}
          />
        )}
        {/* Markers for filtered hoardings */}
        {filteredHoardings.map((hoarding) => {
          const coords = parseCoordinates(hoarding.location?.coordinates);
          console.log('Marker coords:', coords, hoarding.name);
          if (!coords) {
            console.warn('Invalid coordinates for hoarding:', hoarding._id, hoarding.location?.coordinates);
            return null;
          }
          return (
            <Marker
              key={hoarding._id}
              position={coords}
              onClick={() => setSelectedHoarding(hoarding)}
              icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png' }}
            />
          );
        })}
        {/* InfoWindow for selected hoarding */}
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