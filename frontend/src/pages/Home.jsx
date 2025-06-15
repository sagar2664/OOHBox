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
    getHoardings({ limit: 100, status: "approved" }).then(data => {
      setHoardings(data.hoardings || []);
      setLoading(false);
    }).catch(err => {
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
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[500px]">
        <img
          src={heroImage}
          alt="Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-center text-white max-w-3xl px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Find the Perfect Outdoor Advertising Space
            </h1>
            <p className="text-lg md:text-xl mb-8">
              Discover and book premium hoarding locations across India
            </p>
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  placeholder="Enter city..."
                  className="flex-1 px-4 py-3 rounded"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
                <select
                  className="px-4 py-3 rounded"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="Static Billboard">Static Billboard</option>
                  <option value="Digital OOH (DOOH)">Digital OOH (DOOH)</option>
                  <option value="Transit">Transit</option>
                  <option value="Street Furniture">Street Furniture</option>
                  <option value="Wallscape">Wallscape</option>
                  <option value="Gantry">Gantry</option>
                  <option value="Other">Other</option>
                </select>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-8 py-3 rounded font-semibold hover:bg-blue-700 transition"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">Explore Hoardings Near You</h2>
        {loading ? (
          <div className="h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
            Loading map...
          </div>
        ) : (
          <HoardingMap hoardings={hoardings} />
        )}
      </div>
      
      {/* Featured Hoardings */}
      <div className="max-w-6xl mx-auto mt-10 px-4">
        <h2 className="text-lg sm:text-xl font-bold mb-4">Featured Hoardings</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map(h => (
            <HoardingCard key={h._id} hoarding={h} />
          ))}
        </div>
      </div>
    </div>
  );
}