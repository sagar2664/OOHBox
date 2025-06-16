import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getHoardingById, getHoardingReviews, createBooking } from "../api/api";
import { useAuth } from "../hooks/useAuth";

// --- Reusable Icon Component ---
const Icon = ({ path, className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={path}></path>
    </svg>
);

// --- Star Rating Component ---
const StarRating = ({ rating }) => (
    <div className="flex items-center">
        {Array.from({ length: 5 }, (_, i) => (
            <svg key={i} className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.564-.955L10 0l2.948 5.955 6.564.955-4.756 4.635 1.122 6.545z" />
            </svg>
        ))}
    </div>
);

// --- Skeleton Loader for a Better Loading Experience ---
const DetailSkeleton = () => (
    <div className="bg-gray-50 animate-pulse">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-12"></div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="h-96 bg-gray-200 rounded-lg mb-4"></div>
                <div className="flex gap-2 mb-8">
                    <div className="w-24 h-16 bg-gray-200 rounded"></div>
                    <div className="w-24 h-16 bg-gray-200 rounded"></div>
                    <div className="w-24 h-16 bg-gray-200 rounded"></div>
                </div>
                <div className="flex flex-col lg:flex-row gap-12">
                    <div className="w-full lg:w-2/3">
                        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                        <div className="h-5 bg-gray-200 rounded w-1/2 mb-8"></div>
                        <div className="h-40 bg-gray-200 rounded w-full"></div>
                    </div>
                    <div className="w-full lg:w-1/3">
                        <div className="h-48 bg-gray-200 rounded-lg"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// =================================================================================
// MAIN HOARDING DETAIL COMPONENT
// =================================================================================
export default function HoardingDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [hoarding, setHoarding] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showBooking, setShowBooking] = useState(false);
    const [bookingForm, setBookingForm] = useState({ startDate: "", endDate: "", notes: "" });
    const [bookingError, setBookingError] = useState("");
    const [bookingSuccess, setBookingSuccess] = useState(""); // Kept for future use if needed
    const [bookingLoading, setBookingLoading] = useState(false);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [activeTab, setActiveTab] = useState('specs');
    const { user, token } = useAuth();

    // Original useEffect logic preserved
    useEffect(() => {
        window.scrollTo(0, 0);
        setLoading(true);
        getHoardingById(id).then(data => {
            setHoarding(data);
            setLoading(false);
        });
        getHoardingReviews(id, { limit: 5 }).then(data => {
            setReviews(data.reviews || []);
        });
    }, [id]);

    // Original handleBookingChange logic preserved
    const handleBookingChange = e => setBookingForm(f => ({ ...f, [e.target.name]: e.target.value }));

    // Original handleBookingSubmit logic preserved
    const handleBookingSubmit = async e => {
        e.preventDefault();
        setBookingError("");
        setBookingSuccess("");
        setBookingLoading(true);
        try {
            const res = await createBooking({
                hoardingId: id,
                startDate: bookingForm.startDate,
                endDate: bookingForm.endDate,
                notes: bookingForm.notes,
            }, token);

            if (res.booking) {
                setShowBooking(false);
                setBookingForm({ startDate: "", endDate: "", notes: "" });
                navigate("/my-bookings");
            }
        } catch (error) {
            if (error.response?.data?.errors && error.response.data.errors.length > 0) {
                const validationError = error.response.data.errors[0];
                setBookingError(validationError.msg);
            } else {
                setBookingError(error.message || "An error occurred while booking. Please try again.");
            }
        } finally {
            setBookingLoading(false);
        }
    };

    // Original media navigation logic preserved
    const nextMedia = () => {
        if (!hoarding || hoarding.media.length === 0) return;
        setCurrentMediaIndex((prev) => (prev + 1) % hoarding.media.length);
    };

    const prevMedia = () => {
        if (!hoarding || hoarding.media.length === 0) return;
        setCurrentMediaIndex((prev) => (prev - 1 + hoarding.media.length) % hoarding.media.length);
    };

    if (loading) {
        return <DetailSkeleton />;
    }

    if (!hoarding) {
        return <div className="text-center py-20 text-xl text-gray-600">Hoarding not found.</div>;
    }

    // Original currentMedia logic preserved
    const currentMedia = hoarding.media?.[currentMediaIndex];
    const TABS = {
        specs: 'Specifications',
        audience: 'Audience Insights',
        installation: 'Installation Details'
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                
                <nav className="text-sm text-gray-500 mb-8">
                    <Link to="/" className="hover:text-blue-600">Home</Link>
                    <span className="mx-2">/</span>
                    <Link to="/search" className="hover:text-blue-600">Search</Link>
                    <span className="mx-2">/</span>
                    <span className="text-gray-700 font-medium">{hoarding.name}</span>
                </nav>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* --- Media Gallery with original logic --- */}
                    <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-100 mb-8">
                        <div className="relative w-full h-64 md:h-[450px] bg-gray-100 rounded-lg overflow-hidden group">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentMediaIndex}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="w-full h-full"
                                >
                                    {hoarding.media.length > 0 ? (
                                        <>
                                            {currentMedia.mediaType === 'image' ? (
                                                <img src={currentMedia.url} alt={currentMedia.caption || hoarding.name} className="object-cover w-full h-full" />
                                            ) : currentMedia.mediaType === 'video' ? (
                                                <video src={currentMedia.url} className="object-cover w-full h-full" controls autoPlay muted loop />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center"><span className="text-gray-500">360° View</span></div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-500">No media available</div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                            {hoarding.media.length > 1 && (
                                <>
                                    <button onClick={prevMedia} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full transition opacity-0 group-hover:opacity-100 hover:bg-black/60"><Icon path="M15 19l-7-7 7-7" /></button>
                                    <button onClick={nextMedia} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full transition opacity-0 group-hover:opacity-100 hover:bg-black/60"><Icon path="M9 5l7 7-7 7" /></button>
                                </>
                            )}
                        </div>
                        {hoarding.media && hoarding.media.length > 1 && (
                            <div className="flex gap-2 mt-3 overflow-x-auto p-1">
                                {hoarding.media.map((media, index) => (
                                    <button key={index} onClick={() => setCurrentMediaIndex(index)} className={`w-24 h-16 flex-shrink-0 rounded-md overflow-hidden transition ${currentMediaIndex === index ? 'ring-2 ring-offset-2 ring-blue-500' : 'opacity-70 hover:opacity-100'}`}>
                                        <img src={media.url} alt={`thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                        <div className="w-full lg:w-2/3">
                            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">{hoarding.name}</h1>
                                <div className="flex items-center text-gray-500 mb-2">
                                    <Icon path="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                                    <span className="ml-2">{hoarding.location?.address}, {hoarding.location?.city}, {hoarding.location?.state}</span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
                                    <div className="flex items-center gap-1.5"><StarRating rating={hoarding.averageRating} /><span>{hoarding.averageRating?.toFixed(1) || "New"} ({hoarding.reviewCount || 0} reviews)</span></div>
                                </div>
                                <p className="text-gray-700 leading-relaxed mb-8">{hoarding.description}</p>
                                
                                <div className="border-b border-gray-200"><nav className="-mb-px flex space-x-6">
                                    {Object.keys(TABS).map(tabKey => <button key={tabKey} onClick={() => setActiveTab(tabKey)} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tabKey ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>{TABS[tabKey]}</button>)}
                                </nav></div>
                                
                                <div className="py-6 text-sm text-gray-800">
                                    {activeTab === 'specs' && (
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <h4 className="font-medium text-gray-900 mb-1">Type</h4>
                                                <p className="text-gray-600">{hoarding.mediaType || 'N/A'}</p>
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <h4 className="font-medium text-gray-900 mb-1">Size</h4>
                                                <p className="text-gray-600">{hoarding.specs?.width && hoarding.specs?.height ? `${hoarding.specs.width} x ${hoarding.specs.height} ${hoarding.specs.units}` : 'N/A'}</p>
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <h4 className="font-medium text-gray-900 mb-1">Illumination</h4>
                                                <p className="text-gray-600">{hoarding.specs?.illumination || 'N/A'}</p>
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <h4 className="font-medium text-gray-900 mb-1">Orientation</h4>
                                                <p className="text-gray-600">{hoarding.specs?.orientation || 'N/A'}</p>
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <h4 className="font-medium text-gray-900 mb-1">Resolution</h4>
                                                <p className="text-gray-600">{hoarding.digitalSpecs?.resolution || 'N/A'}</p>
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <h4 className="font-medium text-gray-900 mb-1">Pixel Dimensions</h4>
                                                <p className="text-gray-600">{hoarding.digitalSpecs?.pixelDimensions ? `${hoarding.digitalSpecs.pixelDimensions.width} x ${hoarding.digitalSpecs.pixelDimensions.height}` : 'N/A'}</p>
                                            </div>
                                        </div>
                                    )}
                                    {activeTab === 'audience' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <h4 className="font-medium text-gray-900 mb-1">Daily Traffic</h4>
                                                <p className="text-gray-600">{hoarding.audience?.footfall?.volume ? `${hoarding.audience.footfall.volume.toLocaleString()} (${hoarding.audience.footfall.period})` : 'N/A'}</p>
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <h4 className="font-medium text-gray-900 mb-1">Demographics</h4>
                                                <p className="text-gray-600">{hoarding.audience?.demographics?.join(', ') || 'N/A'}</p>
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <h4 className="font-medium text-gray-900 mb-1">Commute Patterns</h4>
                                                <p className="text-gray-600">{hoarding.audience?.commutePatterns?.join(', ') || 'N/A'}</p>
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <h4 className="font-medium text-gray-900 mb-1">Best Suited For</h4>
                                                <p className="text-gray-600">{hoarding.audience?.bestSuitedFor?.join(', ') || 'N/A'}</p>
                                            </div>
                                        </div>
                                    )}
                                    {activeTab === 'installation' && (
                                        <div className="space-y-4">
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <h4 className="font-medium text-gray-900 mb-1">Lead Time</h4>
                                                <p className="text-gray-600">{hoarding.installation?.leadTimeDays ? `${hoarding.installation.leadTimeDays} days` : 'N/A'}</p>
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <h4 className="font-medium text-gray-900 mb-1">Access Notes</h4>
                                                <p className="text-gray-600">{hoarding.installation?.accessNotes || 'N/A'}</p>
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <h4 className="font-medium text-gray-900 mb-1">Permit Status</h4>
                                                <p className="text-gray-600">{hoarding.legal?.permitStatus || 'N/A'}</p>
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <h4 className="font-medium text-gray-900 mb-1">Verification Status</h4>
                                                <p className="text-gray-600">{hoarding.verification?.status || 'N/A'}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="bg-white mt-8 p-6 rounded-xl shadow-lg border border-gray-100">
                                <h2 className="text-2xl font-bold mb-4">Reviews</h2>
                                {reviews.length > 0 ? (
                                    <div className="space-y-6">{reviews.map(r => <div key={r._id}>{/* ... review card JSX ... */}</div>)}</div>
                                ) : (<p className="text-gray-500">No reviews yet for this location.</p>)}
                            </div>
                        </div>

                        <div className="w-full lg:w-1/3">
                            <div className="sticky top-24 space-y-4">
                                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg">
                                    <div className="text-gray-500 text-sm mb-1">{hoarding.pricing?.model}</div>
                                    <div className="text-3xl font-extrabold text-blue-600 mb-2">₹{hoarding.pricing?.basePrice.toLocaleString('en-IN')}<span className="text-lg font-medium text-gray-500">/{hoarding.pricing?.per}</span></div>
                                    {hoarding.pricing?.negotiable && <div className="text-xs text-green-600 font-semibold mb-4">Price is negotiable</div>}
                                    
                                    {user && user.role === "buyer" ? (
                                        <button onClick={() => setShowBooking(true)} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">Book Now</button>
                                    ) : (
                                        <Link to="/login" className="block w-full text-center bg-blue-100 text-blue-700 font-bold py-3 rounded-lg hover:bg-blue-200 transition">Login as a Buyer to Book</Link>
                                    )}
                                    <p className="text-xs text-center text-gray-400 mt-3 flex items-center justify-center gap-1"><Icon path="M12 15v2m-6.41-1.41l-1.42 1.42M4 12H2m1.41-6.41L2 4.17m1.42-1.42L4.83 4M12 2v2m6.41 1.41l1.42-1.42M20 12h2m-1.41 6.41l1.42 1.42M12 22v-2" className="w-3 h-3"/>Secure Booking via OOHBox</p>
                                </div>
                                <div className="bg-white rounded-xl border p-4 text-sm text-gray-600 shadow-lg">{/* ... Vendor & Legal Details ... */}</div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <AnimatePresence>
                    {showBooking && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md relative">
                                <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-3xl" onClick={() => setShowBooking(false)}>&times;</button>
                                <h3 className="text-2xl font-bold mb-4">Book: {hoarding.name}</h3>
                                {bookingError && <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{bookingError}</div>}
                                
                                <form onSubmit={handleBookingSubmit} className="space-y-4">
                                    <div><label className="text-sm font-medium text-gray-700 block mb-1">Start Date</label><input type="date" name="startDate" value={bookingForm.startDate} onChange={handleBookingChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" required /></div>
                                    <div><label className="text-sm font-medium text-gray-700 block mb-1">End Date</label><input type="date" name="endDate" value={bookingForm.endDate} onChange={handleBookingChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" required /></div>
                                    <div><label className="text-sm font-medium text-gray-700 block mb-1">Notes (optional)</label><textarea name="notes" value={bookingForm.notes} onChange={handleBookingChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" maxLength={500} rows={3} /></div>
                                    <button className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold mt-2 transition-transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed" disabled={bookingLoading}>{bookingLoading ? "Processing..." : "Confirm Booking"}</button>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}