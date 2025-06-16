import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getHoardings } from "../api/api";
import HoardingCard from "../components/HoardingCard";

// --- Constants for Filters ---
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


// --- Helper Components for a Cleaner UI ---

// Accordion for cleaning up the filter sidebar
const AccordionSection = ({ title, children, isOpenDefault = false }) => {
  const [isOpen, setIsOpen] = useState(isOpenDefault);
  return (
    <div className="border-b border-gray-200 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full text-left font-semibold text-gray-700 hover:text-blue-600"
      >
        <span>{title}</span>
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </motion.span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pt-4 space-y-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Skeleton card for a professional loading state
const SkeletonCard = () => (
  <div className="bg-white p-4 rounded-lg shadow-md animate-pulse">
    <div className="w-full h-40 bg-gray-200 rounded-md mb-4"></div>
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
  </div>
);

// Empty state for when no results are found
const EmptyState = ({ onClear }) => (
    <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white rounded-lg shadow-sm">
        <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Hoardings Found</h3>
        <p className="text-gray-500 mb-4">Try adjusting your search filters to find what you're looking for.</p>
        <button onClick={onClear} className="bg-blue-600 text-white font-semibold py-2 px-5 rounded-md hover:bg-blue-700 transition">
            Clear All Filters
        </button>
    </div>
);


// =================================================================================
// MAIN SEARCH COMPONENT
// =================================================================================
export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [hoardings, setHoardings] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Consolidate state into a single object for easier management
  const [query, setQuery] = useState(() => {
    const params = Object.fromEntries([...searchParams]);
    return {
      city: params.city || "",
      mediaType: params.mediaType || "",
      illumination: params.illumination || "",
      minPrice: params.minPrice || "",
      maxPrice: params.maxPrice || "",
      sort: params.sort || 'rating_desc', // Default sort
      page: Number(params.page) || 1,
    };
  });

  // Use useCallback to memoize the data fetching function
  const fetchData = useCallback(() => {
    setLoading(true);
    // Create a clean set of parameters to send to the API
    const apiParams = {
      ...query,
      limit: 9, // Let's use 9 for a nice 3x3 grid
      status: "approved",
    };
    // Remove any empty/null values before sending
    Object.keys(apiParams).forEach(key => (apiParams[key] === '' || apiParams[key] == null) && delete apiParams[key]);
    
    getHoardings(apiParams).then(data => {
      setHoardings(data.hoardings || []);
      setTotal(data.totalHoardings || 0);
    }).catch(console.error).finally(() => setLoading(false));

    // Update the URL search params to reflect the current query state
    setSearchParams(apiParams, { replace: true });

  }, [query, setSearchParams]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterChange = e => {
    const { name, value } = e.target;
    setQuery(q => ({ ...q, [name]: value, page: 1 })); // Reset page on filter change
  };
  
  const handleFormSubmit = e => {
    e.preventDefault();
    fetchData(); // Manually trigger fetch on form submit
  };

  const clearFilters = () => {
    const defaultQuery = { city: "", mediaType: "", illumination: "", minPrice: "", maxPrice: "", sort: 'rating_desc', page: 1 };
    setQuery(defaultQuery);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= Math.ceil(total / 9)) {
      setQuery(q => ({ ...q, page: newPage }));
    }
  };
  
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">Find Your Perfect Ad Space</h1>
          <p className="mt-2 text-lg text-gray-600">Use our advanced filters to narrow down the best OOH spots in India.</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          
          {/* --- Sidebar Filters --- */}
          <aside className="w-full md:w-1/4 lg:w-1/5">
            <form onSubmit={handleFormSubmit} className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-xl text-gray-800">Filters</h3>
                <button type="button" onClick={clearFilters} className="text-sm font-medium text-blue-600 hover:text-blue-800 transition">Clear All</button>
              </div>
              
              <AccordionSection title="Location" isOpenDefault={true}>
                 <label htmlFor="city" className="text-sm font-medium text-gray-700">City</label>
                 <input id="city" name="city" type="text" placeholder="e.g., Pune" className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={query.city} onChange={handleFilterChange} />
              </AccordionSection>
              
              <AccordionSection title="Media Type">
                 <select name="mediaType" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={query.mediaType} onChange={handleFilterChange}>
                   {HOARDING_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                 </select>
              </AccordionSection>

               <AccordionSection title="Illumination">
                 <select name="illumination" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={query.illumination} onChange={handleFilterChange}>
                   {ILLUMINATION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                 </select>
              </AccordionSection>
              
              <AccordionSection title="Price Range">
                <div className="flex items-center gap-2">
                  <input name="minPrice" type="number" placeholder="Min" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={query.minPrice} onChange={handleFilterChange} />
                  <span>-</span>
                  <input name="maxPrice" type="number" placeholder="Max" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={query.maxPrice} onChange={handleFilterChange} />
                </div>
              </AccordionSection>

              <button type="submit" className="w-full mt-6 bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition-transform hover:scale-105 shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300">
                Apply Filters
              </button>
            </form>
          </aside>

          {/* --- Results --- */}
          <main className="flex-1">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-lg shadow-sm border">
              <p className="text-sm text-gray-700 font-medium">
                {loading ? 'Searching...' : `Showing ${hoardings.length} of ${total} results`}
              </p>
              <div className="flex items-center gap-2">
                <label htmlFor="sort" className="text-sm font-medium text-gray-700">Sort by:</label>
                <select id="sort" name="sort" className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white" value={query.sort} onChange={handleFilterChange}>
                  <option value="rating_desc">Best Rating</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="createdAt_desc">Newest</option>
                </select>
              </div>
            </div>
            
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              <AnimatePresence>
                {loading ? (
                  Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)
                ) : hoardings.length > 0 ? (
                  hoardings.map((h, i) => (
                    <motion.div
                      key={h._id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1, transition: { delay: i * 0.05 } }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <HoardingCard hoarding={h} />
                    </motion.div>
                  ))
                ) : (
                  <EmptyState onClear={clearFilters} />
                )}
              </AnimatePresence>
            </motion.div>

            {/* Pagination */}
            {!loading && total > 9 && (
              <div className="flex justify-center mt-12">
                <nav className="inline-flex rounded-md shadow-sm gap-1" aria-label="Pagination">
                    <button onClick={() => handlePageChange(query.page - 1)} disabled={query.page === 1} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Prev</button>
                    <span className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border-t border-b border-gray-300">Page {query.page} of {Math.ceil(total / 9)}</span>
                    <button onClick={() => handlePageChange(query.page + 1)} disabled={query.page >= Math.ceil(total / 9)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
                </nav>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}