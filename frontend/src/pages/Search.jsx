import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getHoardings } from "../api/api";
import HoardingCard from "../components/HoardingCard";

const TYPES = [
  { label: "All Types", value: "" },
  { label: "Billboard", value: "billboard" },
  { label: "Digital", value: "digital" },
  { label: "Wall", value: "wall" },
  { label: "Other", value: "other" },
];

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [hoardings, setHoardings] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [filters, setFilters] = useState({
    city: searchParams.get("city") || "",
    type: searchParams.get("type") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
  });

  useEffect(() => {
    setLoading(true);
    const params = {
      ...Object.fromEntries([...searchParams]),
      page,
      limit: 8,
      status: "pending",
    };
    getHoardings(params).then(data => {
      setHoardings(data.hoardings || []);
      setTotal(data.totalHoardings || 0);
      setLoading(false);
    });
  }, [searchParams, page]);

  const handleFilterChange = e => {
    setFilters(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleFilterSubmit = e => {
    e.preventDefault();
    const params = {};
    if (filters.city) params.city = filters.city;
    if (filters.type) params.type = filters.type;
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    setSearchParams(params);
    setPage(1);
  };

  const handlePageChange = newPage => {
    setPage(newPage);
    setSearchParams({ ...Object.fromEntries([...searchParams]), page: newPage });
  };

  return (
    <div className="flex flex-col md:flex-row max-w-7xl mx-auto px-2 md:px-4 py-6 min-h-[80vh]">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 mb-6 md:mb-0 md:mr-6">
        <form onSubmit={handleFilterSubmit} className="bg-white rounded shadow p-4 flex flex-col gap-4 sticky top-4">
          <h3 className="font-semibold text-lg mb-2">Filters</h3>
          <div>
            <label className="block text-sm font-medium mb-1">City</label>
            <input
              name="city"
              type="text"
              placeholder="Enter city..."
              className="border rounded px-3 py-2 w-full"
              value={filters.city}
              onChange={handleFilterChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              name="type"
              className="border rounded px-3 py-2 w-full"
              value={filters.type}
              onChange={handleFilterChange}
            >
              {TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <input
              name="minPrice"
              type="number"
              placeholder="Min"
              className="border rounded px-3 py-2 w-full"
              value={filters.minPrice}
              onChange={handleFilterChange}
            />
            <input
              name="maxPrice"
              type="number"
              placeholder="Max"
              className="border rounded px-3 py-2 w-full"
              value={filters.maxPrice}
              onChange={handleFilterChange}
            />
          </div>
          <button className="bg-blue-600 text-white py-2 rounded font-semibold flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" /></svg>
            Apply Filters
          </button>
        </form>
      </aside>
      {/* Results */}
      <main className="flex-1">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="text-sm text-gray-600">
            {loading ? "Loading..." : `${total} hoardings found`}
            {filters.city && !loading && (
              <span> in <span className="font-semibold text-blue-600">{filters.city}</span></span>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {hoardings.map(h => (
            <HoardingCard key={h.id} hoarding={h} />
          ))}
        </div>
        {/* Pagination */}
        {total > 8 && (
          <div className="flex justify-center mt-8">
            <nav className="inline-flex gap-1">
              {Array.from({ length: Math.ceil(total / 8) }, (_, i) => (
                <button
                  key={i + 1}
                  className={`w-8 h-8 rounded border text-sm font-medium ${page === i + 1 ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100"}`}
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </nav>
          </div>
        )}
      </main>
    </div>
  );
}