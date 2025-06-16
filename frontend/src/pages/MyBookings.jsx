import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { getMyBookings } from "../api/api";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// --- Reusable Icon Component ---
const Icon = ({ path, className = "w-6 h-6" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={path}></path>
    </svg>
);

// --- Status Badge Component for consistent styling ---
const StatusBadge = ({ status }) => {
    const statusStyles = {
        pending: "bg-yellow-100 text-yellow-800",
        accepted: "bg-green-100 text-green-800",
        rejected: "bg-red-100 text-red-800",
        default: "bg-gray-100 text-gray-800",
    };
    return (
        <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${statusStyles[status] || statusStyles.default}`}>
            {status}
        </span>
    );
};

// --- Skeleton Loader for a better UX ---
const BookingSkeleton = () => (
    <div className="bg-white p-4 rounded-xl shadow-sm border animate-pulse">
        <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-40 h-28 bg-gray-200 rounded-lg"></div>
            <div className="flex-1 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
            <div className="w-full md:w-1/5 space-y-2">
                 <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                 <div className="h-8 bg-gray-200 rounded w-28"></div>
            </div>
        </div>
    </div>
);

// --- Empty State for when there are no bookings ---
const EmptyState = () => (
    <div className="text-center bg-white p-12 rounded-xl shadow-sm border">
        <Icon path="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">You haven't made any bookings yet.</h3>
        <p className="text-gray-500 mb-6">Once you book an ad space, your campaign details will appear here.</p>
        <Link to="/search" className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
            Find Ad Spaces
        </Link>
    </div>
);


// =================================================================================
// MAIN MY BOOKINGS COMPONENT
// =================================================================================
export default function MyBookings() {
    const { token, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("all");

    // Original useEffect logic is preserved
    useEffect(() => {
        if (authLoading) return;
        if (!token) {
            navigate('/login');
            return;
        }

        setLoading(true);
        getMyBookings(token)
            .then(res => {
                if (res.bookings) {
                    setBookings(res.bookings);
                    setError("");
                } else {
                    setError(res.message || "Could not fetch bookings");
                }
            })
            .catch(err => {
                if (err.response?.status === 401) {
                    navigate('/login');
                } else {
                    setError(err.message || "An error occurred while fetching bookings.");
                }
            })
            .finally(() => {
                setLoading(false);
            });
    }, [token, authLoading, navigate]);

    const filteredBookings = bookings.filter(b => {
        if (activeTab === "all") return true;
        return b.status === activeTab;
    });

    return (
        <div className="bg-gray-50 min-h-screen">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-screen-lg mx-auto px-4 py-8"
            >
                <header className="mb-8">
                    <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">My Bookings</h1>
                    <p className="mt-1 text-gray-500">Review and manage all your past and present OOH campaigns.</p>
                </header>

                {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">{error}</div>}

                {/* --- Tab Filters --- */}
                <div className="mb-6 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-6">
                        <TabButton label="All" isActive={activeTab === 'all'} onClick={() => setActiveTab('all')} />
                        <TabButton label="Pending" isActive={activeTab === 'pending'} onClick={() => setActiveTab('pending')} />
                        <TabButton label="Accepted" isActive={activeTab === 'accepted'} onClick={() => setActiveTab('accepted')} />
                        <TabButton label="Rejected" isActive={activeTab === 'rejected'} onClick={() => setActiveTab('rejected')} />
                    </nav>
                </div>
                
                {/* --- Bookings List --- */}
                <div className="space-y-6">
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => <BookingSkeleton key={i} />)
                    ) : filteredBookings.length > 0 ? (
                        <AnimatePresence>
                            {filteredBookings.map((b, i) => (
                                <motion.div
                                    key={b._id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }}
                                    exit={{ opacity: 0 }}
                                >
                                    <BookingCard booking={b} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    ) : (
                        <EmptyState />
                    )}
                </div>
            </motion.div>
        </div>
    );
}


// --- Sub-components for better organization ---

const TabButton = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
            isActive
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
        }`}
    >
        {label}
    </button>
);

const BookingCard = ({ booking: b }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm border hover:shadow-md transition-shadow duration-300">
        <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Image */}
            <Link to={`/hoardings/${b.hoardingId?._id}`} className="w-full md:w-40 h-28 flex-shrink-0">
                <img
                    src={b.hoardingId?.media?.[0]?.url || "https://via.placeholder.com/300x200.png?text=No+Image"}
                    alt={b.hoardingId?.name}
                    className="w-full h-full object-cover rounded-lg"
                />
            </Link>

            {/* Main Details */}
            <div className="flex-1">
                <Link to={`/hoardings/${b.hoardingId?._id}`} className="font-bold text-lg text-gray-800 hover:text-blue-600 transition-colors">
                    {b.hoardingId?.name || "Hoarding Details Unavailable"}
                </Link>
                <div className="flex items-center text-gray-500 text-sm mt-1">
                    <Icon path="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" className="w-4 h-4 mr-1.5" />
                    {b.hoardingId?.location?.city || "Unknown Location"}
                </div>
                <div className="flex items-center text-gray-700 text-sm mt-2 font-medium">
                    <Icon path="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" className="w-4 h-4 mr-1.5 text-gray-400" />
                    {new Date(b.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} - {new Date(b.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
                 <div className="text-sm mt-2 text-gray-700">Total: <span className="font-bold">₹{b.totalPrice.toLocaleString('en-IN')}</span></div>
            </div>

            {/* Status & Actions */}
            <div className="w-full md:w-auto flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start pt-2 md:pt-0 space-y-0 md:space-y-3">
                 <StatusBadge status={b.status} />
                 {/* --- VIEW DETAILS BUTTON RESTORED HERE --- */}
                 <Link 
                    to={`/booking/${b._id}`}
                    className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-blue-100 transition-colors"
                >
                    View Details
                </Link>
            </div>
        </div>
    </div>
);