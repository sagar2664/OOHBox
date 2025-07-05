import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../hooks/useAuth";
import { getVendorHoardings, getVendorBookings, updateBookingStatus } from "../api/api";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// --- HELPER & UI COMPONENTS (with enhancements) ---

const Icon = ({ path, className = "w-6 h-6" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={path} />
    </svg>
);

const StatusBadge = ({ status }) => {
    const statusMap = {
        pending: "bg-yellow-100 text-yellow-800",
        accepted: "bg-blue-100 text-blue-800",
        active: "bg-green-100 text-green-800",
        completed: "bg-gray-200 text-gray-700",
        rejected: "bg-red-100 text-red-800",
        cancelled: "bg-red-100 text-red-800",
    };
    const normalizedStatus = status?.toLowerCase() || 'unknown';
    return (
        <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full capitalize ${statusMap[normalizedStatus] || "bg-gray-200 text-gray-600"}`}>
            {normalizedStatus.replace('_', ' ')}
        </span>
    );
};

const StatCard = ({ title, value, icon, color, description }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border flex flex-col justify-between h-full">
        <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${color}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
        <p className="text-xs text-gray-400 mt-3">{description}</p>
    </div>
);

// New WelcomeGuide component
const WelcomeGuide = ({ name, onDismiss }) => (
    <div className="bg-blue-600 text-white p-6 rounded-xl shadow-lg mb-8 relative">
        <button onClick={onDismiss} className="absolute top-3 right-3 text-white/70 hover:text-white">&times;</button>
        <h2 className="text-2xl font-bold mb-2">Welcome to Your Dashboard, {name}!</h2>
        <p className="text-blue-100 max-w-2xl">This is your command center for managing your ad spaces. You can add new hoardings, respond to booking requests from advertisers, and track your earnings all in one place. Use the tabs below to get started.</p>
    </div>
);

const EmptyState = ({ message, ctaText, ctaLink }) => (
    <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
            <Icon path="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" className="w-16 h-16 mx-auto" />
        </div>
        <p className="text-gray-500 mb-4">{message}</p>
        {ctaText && ctaLink && (
            <button onClick={() => window.location.href = ctaLink} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
                {ctaText}
            </button>
        )}
    </div>
);


// =================================================================================
// MAIN VENDOR DASHBOARD COMPONENT
// =================================================================================
export default function VendorDashboard() {
    const { user, token, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [hoardings, setHoardings] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [showWelcome, setShowWelcome] = useState(true); // To control the welcome guide

    // Handle URL query parameters for tab switching
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const tabParam = urlParams.get('tab');
        if (tabParam && ['overview', 'hoardings', 'bookings', 'history'].includes(tabParam)) {
            setActiveTab(tabParam);
        }
    }, [location.search]);

    // Original useEffect logic preserved
    useEffect(() => {
        if (authLoading) return;
        if (!token) {
            navigate('/login');
            return;
        }

        setLoading(true);
        setError(null);

        Promise.all([
            getVendorHoardings(token, {}).catch(err => {
                console.error('Error fetching hoardings:', err);
                setError(err.message || "Failed to fetch hoardings.");
                return { hoardings: [] };
            }),
            getVendorBookings(token, {}).catch(err => {
                console.error('Error fetching bookings:', err);
                setError(err.message || "Failed to fetch bookings.");
                return { bookings: [] };
            })
        ]).then(([hRes, bRes]) => {
            setHoardings(hRes.hoardings || []);
            setBookings(bRes.bookings || []);
            setLoading(false);
        });
    }, [token, authLoading, navigate]);

    // Original handleBookingAction logic preserved
    const handleBookingAction = async (bookingId, status) => {
        try {
            await updateBookingStatus(bookingId, status, token);
            const updatedBookings = await getVendorBookings(token, {});
            setBookings(updatedBookings.bookings || []);
        } catch (error) {
            console.error('Error updating booking status:', error);
            setError(error.message || "Could not update booking status.");
        }
    };

    const stats = useMemo(() => {
        const pendingRequests = bookings.filter(b => b.status === 'pending').length;
        const activeCampaigns = bookings.filter(b => b.status === 'accepted').length;
        const totalEarnings = bookings
            .filter(b => b.status === 'completed')
            .reduce((acc, b) => acc + (b.totalPrice || 0), 0);
        return { pendingRequests, activeCampaigns, totalEarnings };
    }, [bookings]);

    const TABS = {
        overview: 'Overview',
        hoardings: 'My Hoardings',
        bookings: 'Booking Requests',
        history: 'Booking History',
    };
    
    // Skeleton for initial loading
    if (authLoading || (loading && hoardings.length === 0 && bookings.length === 0)) {
        return <div className="text-center py-20">Loading Your Dashboard...</div>
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-screen-xl mx-auto px-4 py-8"
            >
                <AnimatePresence>
                    {showWelcome && (
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0, marginBottom: 0 }}>
                            <WelcomeGuide name={user?.firstName || 'Vendor'} onDismiss={() => setShowWelcome(false)} />
                        </motion.div>
                    )}
                </AnimatePresence>

                <header className="mb-8">
                    <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">Vendor Dashboard</h1>
                    <p className="mt-1 text-gray-500">Manage your properties and bookings here.</p>
                </header>

                {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">{error}</div>}

                <div className="border-b border-gray-200 mb-8">
                    <nav className="-mb-px flex space-x-6 overflow-x-auto">
                        {Object.keys(TABS).map(tabKey => (
                            <button key={tabKey} onClick={() => {
                                setActiveTab(tabKey);
                                // Update URL without page reload
                                const newUrl = tabKey === 'overview' 
                                    ? '/vendor-dashboard' 
                                    : `/vendor-dashboard?tab=${tabKey}`;
                                navigate(newUrl, { replace: true });
                            }} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tabKey ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>
                                {TABS[tabKey]}
                            </button>
                        ))}
                    </nav>
                </div>
                
                <AnimatePresence mode="wait">
                    <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                        {activeTab === 'overview' && <DashboardOverview stats={stats} hoardings={hoardings} bookings={bookings} navigate={navigate} setActiveTab={setActiveTab} />}
                        {activeTab === 'hoardings' && <HoardingsList hoardings={hoardings} navigate={navigate} />}
                        {activeTab === 'bookings' && <BookingsList bookings={bookings.filter(b => ['pending', 'accepted'].includes(b.status))} handleBookingAction={handleBookingAction} navigate={navigate} />}
                        {activeTab === 'history' && <BookingsList bookings={bookings.filter(b => ['completed', 'rejected', 'cancelled'].includes(b.status))} handleBookingAction={handleBookingAction} navigate={navigate} isHistory={true} />}
                    </motion.div>
                </AnimatePresence>

            </motion.div>
        </div>
    );
}

// --- TAB CONTENT COMPONENTS ---

const DashboardOverview = ({ stats, hoardings, bookings, navigate, setActiveTab }) => {
    const recentActivity = bookings.slice(0, 3);
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Total Ad Spaces" value={hoardings.length} icon={<Icon path="M4 6h16M4 10h16M4 14h16M4 18h16" />} color="bg-blue-100 text-blue-600" description="The total number of hoardings you have listed." />
                <StatCard title="New Booking Requests" value={stats.pendingRequests} icon={<Icon path="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />} color="bg-yellow-100 text-yellow-600" description="New requests from advertisers awaiting your approval." />
                <StatCard title="Total Earnings" value={`₹${stats.totalEarnings.toLocaleString('en-IN')}`} icon={<Icon path="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />} color="bg-green-100 text-green-600" description="Total revenue from all completed campaigns." />
            </div>
            <div>
                 <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <button onClick={() => navigate('/add-hoarding')} className="bg-white p-6 rounded-xl shadow-sm border text-left hover:border-blue-500 hover:shadow-md transition-all">
                        <Icon path="M12 6v6m0 0v6m0-6h6m-6 0H6" className="w-8 h-8 text-blue-600 mb-2"/>
                        <p className="font-bold text-gray-800">Add a New Hoarding</p>
                        <p className="text-sm text-gray-500">List a new ad space to start receiving bookings.</p>
                     </button>
                     <button onClick={() => {
                         setActiveTab('bookings');
                         navigate('/vendor-dashboard?tab=bookings', { replace: true });
                     }} className="bg-white p-6 rounded-xl shadow-sm border text-left hover:border-blue-500 hover:shadow-md transition-all">
                        <Icon path="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" className="w-8 h-8 text-blue-600 mb-2"/>
                        <p className="font-bold text-gray-800">Review Bookings</p>
                        <p className="text-sm text-gray-500">Check new requests from advertisers.</p>
                     </button>
                 </div>
            </div>
        </div>
    );
};

const HoardingsList = ({ hoardings, navigate }) => (
    <div>
        <div className="flex justify-between items-center mb-6">
            <div>
                <h3 className="text-xl font-bold text-gray-800">Your Hoarding Listings</h3>
                <p className="text-gray-500 text-sm">Here you can view, edit, and manage all your ad space listings.</p>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-blue-700 transition" onClick={() => navigate('/add-hoarding')}>
                <Icon path="M12 6v6m0 0v6m0-6h6m-6 0H6" className="w-5 h-5"/> Add New
            </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hoardings.length > 0 ? (
                hoardings.map(h => (
                    <div key={h._id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow duration-300 flex flex-col">
                        <img src={h.media?.[0]?.url || "https://via.placeholder.com/300x200.png?text=No+Image"} alt={h.name} className="w-full h-32 object-cover rounded-t-xl"/>
                        <div className="p-4 flex flex-col flex-grow">
                             <div className="flex justify-between items-start">
                                 <h4 className="font-bold text-gray-800 flex-1 pr-2">{h.name}</h4>
                                 <StatusBadge status={h.status} />
                            </div>
                            <p className="text-sm text-gray-500">{h.location?.city}</p>
                            <div className="border-t my-4"></div>
                            <div className="flex justify-end gap-2 mt-auto">
                                 <button className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-gray-200" onClick={() => navigate(`/edit-hoarding/${h._id}`)}>Edit</button>
                                 <button className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-blue-100" onClick={() => navigate(`/hoardings/${h._id}`)}>View</button>
                            </div>
                        </div>
                    </div>
                ))
            ) : <div className="col-span-full"><EmptyState message="You haven't added any hoardings yet." ctaText="Add Your First Hoarding" ctaLink="/add-hoarding" /></div>}
        </div>
    </div>
);

const BookingsList = ({ bookings, handleBookingAction, navigate, isHistory = false }) => (
    <div>
        <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-800">{isHistory ? 'Past Bookings' : 'Active & Pending Bookings'}</h3>
            <p className="text-gray-500 text-sm">{isHistory ? 'Review your completed or rejected bookings.' : 'Respond to new requests and manage active campaigns.'}</p>
        </div>
        <div className="space-y-4">
            {bookings.length > 0 ? (
                bookings.map(b => <BookingCard key={b._id} booking={b} handleBookingAction={handleBookingAction} navigate={navigate} />)
            ) : <div className="col-span-full"><EmptyState message={isHistory ? "No past bookings found." : "You have no new booking requests. Great job!"} /></div>}
        </div>
    </div>
);

const BookingCard = ({ booking, handleBookingAction, navigate, isSimple = false }) => {
    const { _id, hoardingId, buyerId, startDate, endDate, status } = booking;
    return(
        <div className="bg-white p-4 rounded-xl shadow-sm border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
                <p className="font-bold text-gray-800">{hoardingId?.name || "N/A"}</p>
                <p className="text-sm text-gray-500">
                    Buyer: {buyerId?.firstName || 'Unknown'} | {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
                </p>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto justify-between">
                <StatusBadge status={status} />
                {!isSimple && (
                     <div className="flex items-center gap-2">
                         {status === 'pending' && (
                             <>
                                 <button onClick={() => handleBookingAction(_id, 'accepted')} className="text-xs font-semibold text-green-600 hover:text-green-800">Accept</button>
                                 <button onClick={() => handleBookingAction(_id, 'rejected')} className="text-xs font-semibold text-red-600 hover:text-red-800">Reject</button>
                             </>
                         )}
                         <button onClick={() => navigate(`/booking/${_id}`)} className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-blue-100">
                            Details
                         </button>
                     </div>
                )}
            </div>
        </div>
    )
};