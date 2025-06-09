import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getHoardings } from "../api/api";
import HoardingCard from "../components/HoardingCard";
import HoardingMap from '../components/HoardingMap';
import heroImage from '../assets/images/hero-bg.jpg';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [city, setCity] = useState("");
  const [type, setType] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [hoardings, setHoardings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getHoardings({ limit: 6, status: "approved" }).then(data => setFeatured(data.hoardings || []));
    // Fetch hoardings for the map
    getHoardings({ limit: 100 }).then(data => {
      //console.log('Raw hoardings data:', data.hoardings);
      // Log the first hoarding's location structure
      // if (data.hoardings && data.hoardings.length > 0) {
      //   console.log('Sample hoarding location:', data.hoardings[0].location);
      //   console.log('Sample coordinates:', data.hoardings[0].location?.coordinates);
      // }
      setHoardings(data.hoardings || []);
      setLoading(false);
    }).catch(err => {
      //console.error('Failed to load hoardings:', err);
      setLoading(false);
    });
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = {};
    if (city) params.city = city;
    if (type) params.type = type;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    navigate({ pathname: "/search", search: `?${new URLSearchParams(params).toString()}` });
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Hero Section */}
      {/* <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to OOHBox</h1>
        <p className="text-xl text-gray-600 mb-8">Your one-stop solution for outdoor advertising</p>
        <Link to="/search" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
          Find Hoardings
        </Link>
      </div> */}

      {/* Hero Section */}
      <div
        className="relative bg-cover bg-center min-h-[300px] md:min-h-[350px] flex flex-col justify-center items-center px-4 py-8 md:py-0"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        
        {/* Content */}
        <div className="relative z-10 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-white mb-2">
            Find & Book the Best Hoardings in Your City
          </h1>
          <p className="text-white text-center mb-6 text-sm md:text-base max-w-2xl">
            Discover, compare, and instantly book billboards and digital hoardings with just a few clicks.
          </p>
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2 bg-white rounded shadow p-3 w-full max-w-2xl">
            <input
              type="text"
              placeholder="Enter city"
              className="border rounded px-3 py-2 flex-1 min-w-0"
              value={city}
              onChange={e => setCity(e.target.value)}
            />
            <select
              className="border rounded px-3 py-2 flex-1 min-w-0"
              value={type}
              onChange={e => setType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="billboard">Billboard</option>
              <option value="digital">Digital</option>
              <option value="wall">Wall</option>
              <option value="other">Other</option>
            </select>
            <input
              type="number"
              placeholder="Min Price ($)"
              className="border rounded px-3 py-2 w-full md:w-24"
              value={minPrice}
              onChange={e => setMinPrice(e.target.value)}
            />
            <input
              type="number"
              placeholder="Max Price ($)"
              className="border rounded px-3 py-2 w-full md:w-24"
              value={maxPrice}
              onChange={e => setMaxPrice(e.target.value)}
            />
            <button className="bg-blue-600 text-white px-4 py-2 rounded w-full md:w-auto">
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Map Section */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-12">
        <h2 className="text-2xl font-bold mb-4">Find Hoardings Near You</h2>
        <p className="text-gray-600 mb-6">Explore our network of premium advertising spaces across India</p>
        {loading ? (
          <div className="h-[400px] bg-gray-100 flex items-center justify-center">
            Loading map...
          </div>
        ) : (
          <HoardingMap hoardings={hoardings} />
        )}
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="text-center p-6 bg-white rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-2">Wide Coverage</h3>
          <p className="text-gray-600">Access hoardings across major cities in India</p>
        </div>
        <div className="text-center p-6 bg-white rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-2">Easy Booking</h3>
          <p className="text-gray-600">Simple and secure booking process</p>
        </div>
        <div className="text-center p-6 bg-white rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-2">Verified Locations</h3>
          <p className="text-gray-600">All hoardings are verified for quality and visibility</p>
        </div>
      </div>

      
      {/* Featured Hoardings */}
      <div className="max-w-6xl mx-auto mt-10 px-4">
        <h2 className="text-lg sm:text-xl font-bold mb-4">Featured Hoardings</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map(h => (
            <HoardingCard key={h.id} hoarding={h} />
          ))}
        </div>
      </div>
    </div>
  );
}