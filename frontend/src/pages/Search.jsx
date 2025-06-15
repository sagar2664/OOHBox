import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getHoardings } from "../api/api";
import HoardingCard from "../components/HoardingCard";

const HOARDING_TYPES = [
  { label: "All Types", value: "" },
  { label: "Static Billboard", value: "Static Billboard" },
  { label: "Digital OOH (DOOH)", value: "Digital OOH (DOOH)" },
  { label: "Transit", value: "Transit" },
  { label: "Street Furniture", value: "Street Furniture" },
  { label: "Wallscape", value: "Wallscape" },
  { label: "Gantry", value: "Gantry" },
  { label: "Other", value: "Other" },
];

const ILLUMINATION_TYPES = [
  { label: "All Illumination", value: "" },
  { label: "Backlit", value: "Backlit" },
  { label: "Frontlit", value: "Frontlit" },
  { label: "Digital", value: "Digital" },
  { label: "Non-Illuminated", value: "Non-Illuminated" },
];

const PRICING_MODELS = [
  { label: "All Pricing Models", value: "" },
  { label: "Flat Rate", value: "Flat Rate" },
  { label: "Impression-based", value: "Impression-based" },
  { label: "Programmatic", value: "Programmatic" },
];

const PRICING_PERIODS = [
  { label: "Per Day", value: "day" },
  { label: "Per Week", value: "week" },
  { label: "Per Month", value: "month" },
  { label: "Per Slot", value: "slot" },
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
    mediaType: searchParams.get("mediaType") || "",
    illumination: searchParams.get("illumination") || "",
    pricingModel: searchParams.get("pricingModel") || "",
    pricingPeriod: searchParams.get("pricingPeriod") || "month",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    minWidth: searchParams.get("minWidth") || "",
    maxWidth: searchParams.get("maxWidth") || "",
    minHeight: searchParams.get("minHeight") || "",
    maxHeight: searchParams.get("maxHeight") || "",
    permitStatus: searchParams.get("permitStatus") || "",
  });

  useEffect(() => {
    setLoading(true);
    const params = {
      ...Object.fromEntries([...searchParams]),
      page,
      limit: 8,
      status: "approved",
    };
    getHoardings(params).then(data => {
      setHoardings(data.hoardings || []);
      setTotal(data.totalHoardings || 0);
      setLoading(false);
    });
  }, [searchParams, page]);

  const handleFilterChange = e => {
    const { name, value, type, checked } = e.target;
    setFilters(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFilterSubmit = e => {
    e.preventDefault();
    const params = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params[key] = value;
    });
    setSearchParams(params);
    setPage(1);
  };

  const handlePageChange = newPage => {
    setPage(newPage);
    setSearchParams({ ...Object.fromEntries([...searchParams]), page: newPage });
  };

  const clearFilters = () => {
    setFilters({
      city: "",
      mediaType: "",
      illumination: "",
      pricingModel: "",
      pricingPeriod: "month",
      minPrice: "",
      maxPrice: "",
      minWidth: "",
      maxWidth: "",
      minHeight: "",
      maxHeight: "",
      permitStatus: "",
    });
    setSearchParams({});
    setPage(1);
  };

  return (
    <div className="flex flex-col md:flex-row max-w-7xl mx-auto px-2 md:px-4 py-6 min-h-[80vh]">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-72 mb-6 md:mb-0 md:mr-6">
        <form onSubmit={handleFilterSubmit} className="bg-white rounded shadow p-4 flex flex-col gap-4 sticky top-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-lg">Filters</h3>
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear All
            </button>
          </div>

          {/* Location */}
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

          {/* Media Type */}
          <div>
            <label className="block text-sm font-medium mb-1">Media Type</label>
            <select
              name="mediaType"
              className="border rounded px-3 py-2 w-full"
              value={filters.mediaType}
              onChange={handleFilterChange}
            >
              {HOARDING_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Illumination */}
          <div>
            <label className="block text-sm font-medium mb-1">Illumination</label>
            <select
              name="illumination"
              className="border rounded px-3 py-2 w-full"
              value={filters.illumination}
              onChange={handleFilterChange}
            >
              {ILLUMINATION_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Pricing */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Pricing</label>
            <select
              name="pricingModel"
              className="border rounded px-3 py-2 w-full"
              value={filters.pricingModel}
              onChange={handleFilterChange}
            >
              {PRICING_MODELS.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <select
              name="pricingPeriod"
              className="border rounded px-3 py-2 w-full"
              value={filters.pricingPeriod}
              onChange={handleFilterChange}
            >
              {PRICING_PERIODS.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <input
                name="minPrice"
                type="number"
                placeholder="Min Price"
                className="border rounded px-3 py-2 w-full"
                value={filters.minPrice}
                onChange={handleFilterChange}
              />
              <input
                name="maxPrice"
                type="number"
                placeholder="Max Price"
                className="border rounded px-3 py-2 w-full"
                value={filters.maxPrice}
                onChange={handleFilterChange}
              />
            </div>
          </div>

          {/* Dimensions */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Dimensions</label>
            <div className="flex gap-2">
              <input
                name="minWidth"
                type="number"
                placeholder="Min Width"
                className="border rounded px-3 py-2 w-full"
                value={filters.minWidth}
                onChange={handleFilterChange}
              />
              <input
                name="maxWidth"
                type="number"
                placeholder="Max Width"
                className="border rounded px-3 py-2 w-full"
                value={filters.maxWidth}
                onChange={handleFilterChange}
              />
            </div>
            <div className="flex gap-2">
              <input
                name="minHeight"
                type="number"
                placeholder="Min Height"
                className="border rounded px-3 py-2 w-full"
                value={filters.minHeight}
                onChange={handleFilterChange}
              />
              <input
                name="maxHeight"
                type="number"
                placeholder="Max Height"
                className="border rounded px-3 py-2 w-full"
                value={filters.maxHeight}
                onChange={handleFilterChange}
              />
            </div>
          </div>

          {/* Legal Status */}
          <div>
            <label className="block text-sm font-medium mb-1">Legal Status</label>
            <select
              name="permitStatus"
              className="border rounded px-3 py-2 w-full"
              value={filters.permitStatus}
              onChange={handleFilterChange}
            >
              <option value="">All Status</option>
              <option value="Verified">Verified</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <button className="bg-blue-600 text-white py-2 rounded font-semibold flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
            </svg>
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
          {Object.values(filters).some(Boolean) && (
            <div className="flex flex-wrap gap-2">
              {Object.entries(filters).map(([key, value]) => {
                if (!value) return null;
                return (
                  <span key={key} className="px-2 py-1 bg-gray-100 rounded text-sm">
                    {key}: {value}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {hoardings.map(h => (
            <HoardingCard key={h._id} hoarding={h} />
          ))}
        </div>

        {/* Pagination */}
        {total > 8 && (
          <div className="flex justify-center mt-8">
            <nav className="inline-flex gap-1">
              {Array.from({ length: Math.ceil(total / 8) }, (_, i) => (
                <button
                  key={i + 1}
                  className={`w-8 h-8 rounded border text-sm font-medium ${
                    page === i + 1 ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
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