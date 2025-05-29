import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getHoardings } from "../api/api";
import HoardingCard from "../components/HoardingCard";

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [city, setCity] = useState("");
  const [type, setType] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getHoardings({ limit: 6, status: "pending" }).then(data => setFeatured(data.hoardings || []));
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
    <div>
      {/* Hero Section */}
      <div
        className="bg-cover bg-center min-h-[300px] md:min-h-[350px] flex flex-col justify-center items-center px-4 py-8 md:py-0"
        style={{ backgroundImage: "url('/hero-bg.jpg')" }}
      >
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-gray-900 mb-2">
          Find & Book the Best Hoardings in Your City
        </h1>
        <p className="text-gray-700 text-center mb-6 text-sm md:text-base max-w-2xl">
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