import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getBookingById,
  updateBookingStatus,
  uploadBookingProof,
  updateInstallation,
  createReview,
  updateReview,
  getReviewByBookingId
} from '../api/api';

// Icon Component
const Icon = ({ path, className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={path} />
  </svg>
);

// Status Badge Component
function StatusBadge({ status }) {
  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-800', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    accepted: { color: 'bg-blue-100 text-blue-800', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    rejected: { color: 'bg-red-100 text-red-800', icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' },
    completed: { color: 'bg-green-100 text-green-800', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    cancelled: { color: 'bg-gray-100 text-gray-800', icon: 'M6 18L18 6M6 6l12 12' },
  };

  const config = statusConfig[status] || statusConfig.pending;
  
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
      <Icon path={config.icon} className="w-3 h-3" />
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
}

// Verification Badge Component
function VerificationBadge({ status }) {
  const statusConfig = {
    Pending: { color: 'bg-yellow-100 text-yellow-800', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    Verified: { color: 'bg-green-100 text-green-800', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    Rejected: { color: 'bg-red-100 text-red-800', icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' },
  };

  const config = statusConfig[status] || statusConfig.Pending;
  
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
      <Icon path={config.icon} className="w-3 h-3" />
      {status}
    </span>
  );
}

// Installation Badge Component
function InstallationBadge({ status }) {
  const statusConfig = {
    Pending: { color: 'bg-yellow-100 text-yellow-800', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    Scheduled: { color: 'bg-blue-100 text-blue-800', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    Completed: { color: 'bg-green-100 text-green-800', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    Cancelled: { color: 'bg-red-100 text-red-800', icon: 'M6 18L18 6M6 6l12 12' },
  };

  const config = statusConfig[status] || statusConfig.Pending;
  
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
      <Icon path={config.icon} className="w-3 h-3" />
      {status}
    </span>
  );
}

// Star Rating Component
function StarRating({ value, onChange, readOnly, size = "text-xl" }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          className={`${size} ${star <= value ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
          onClick={() => !readOnly && onChange(star)}
          disabled={readOnly}
        >
          ★
        </button>
      ))}
    </div>
  );
}

// Loading Skeleton
const LoadingSkeleton = () => (
  <div className="max-w-4xl mx-auto py-10 px-4">
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function BookingDetails() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [booking, setBooking] = useState(null);
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Form states
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showInstallationForm, setShowInstallationForm] = useState(false);
  const [showProofUpload, setShowProofUpload] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '' });
  const [installationForm, setInstallationForm] = useState({
    scheduledDate: '',
    status: 'Scheduled',
    notes: ''
  });
  const [proofFile, setProofFile] = useState(null);

  // Fetch booking data
  const fetchBookingData = async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    try {
      const b = await getBookingById(id, token);
      setBooking(b);
      
      // Fetch review if buyer and booking is completed
      if (user?.role === 'buyer' && b.status === 'completed') {
        try {
          const r = await getReviewByBookingId(b.hoardingId._id, b._id);
          setReview(r);
          if (r) setReviewForm({ rating: r.rating, comment: r.comment || '' });
        } catch (err) {
          console.log('No review found for this booking');
        }
      }
    } catch (err) {
      setError(err.message);
      if (err.message.includes('not authenticated')) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingData();
  }, [id, token, user?.role]);

  // Handle booking status updates
  const handleStatus = async (status) => {
    if (!token) {
      setError('Please login to perform this action');
      return;
    }

    setActionLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (status === 'completed' && !proofFile) {
        setError('Please upload proof of display before marking as completed');
        setActionLoading(false);
        return;
      }
      
      if (status === 'completed') {
        await updateBookingStatus(id, status, token, proofFile);
      } else {
        await updateBookingStatus(id, status, token);
      }
      
      await fetchBookingData();
      setProofFile(null);
      setShowProofUpload(false);
      setSuccessMessage(`Booking ${status} successfully`);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle installation updates
  const handleInstallationUpdate = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('Please login to perform this action');
      return;
    }

    setActionLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await updateInstallation(id, installationForm, token);
      await fetchBookingData();
      setShowInstallationForm(false);
      setInstallationForm({ scheduledDate: '', status: 'Scheduled', notes: '' });
      setSuccessMessage('Installation details updated successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle proof upload
  const handleProofUpload = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('Please login to perform this action');
      return;
    }

    if (!proofFile) {
      setError('Please select an image to upload');
      return;
    }

    setActionLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await uploadBookingProof(id, proofFile, token);
      await fetchBookingData();
      setProofFile(null);
      setShowProofUpload(false);
      setSuccessMessage('Proof uploaded successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle review submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('Please login to perform this action');
      return;
    }

    setActionLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (review) {
        await updateReview(review._id, { rating: reviewForm.rating, comment: reviewForm.comment }, token);
      } else {
        await createReview({
          hoardingId: booking.hoardingId._id,
          bookingId: booking._id,
          rating: reviewForm.rating,
          comment: reviewForm.comment,
        }, token);
      }
      
      const r = await getReviewByBookingId(booking.hoardingId._id, booking._id);
      setReview(r);
      setShowReviewForm(false);
      setSuccessMessage('Review submitted successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProofFile(file);
      setError(null);
    }
  };

  if (loading) return <LoadingSkeleton />;
  if (!booking) return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="text-center">
        <div className="text-red-600 text-xl mb-4">Booking not found</div>
        <Link to="/my-bookings" className="text-blue-600 hover:underline">
          ← Back to My Bookings
        </Link>
      </div>
    </div>
  );

  const isBuyer = user?.role === 'buyer';
  const isVendor = user?.role === 'vendor';
  const isAdmin = user?.role === 'admin';

  // Calculate booking duration
  const startDate = new Date(booking.startDate);
  const endDate = new Date(booking.endDate);
  const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

  return (
    <div className="bg-gray-50 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto py-8 px-4"
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
              <p className="text-gray-600 mt-1">Booking ID: {booking._id}</p>
            </div>
            <Link 
              to="/my-bookings" 
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Icon path="M10 19l-7-7m0 0l7-7m-7 7h18" />
              Back to Bookings
            </Link>
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={booking.status} />
            {booking.verification?.status && booking.verification.status !== 'Pending' && (
              <VerificationBadge status={booking.verification.status} />
            )}
            {booking.installation?.status && booking.installation.status !== 'Pending' && (
              <InstallationBadge status={booking.installation.status} />
            )}
          </div>
        </div>

        {/* Error and Success Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <Icon path="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" className="w-5 h-5" />
                {error}
              </div>
            </motion.div>
          )}
          
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <Icon path="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" className="w-5 h-5" />
                {successMessage}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hoarding Information */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{booking.hoardingId?.name}</h2>
                  <div className="flex items-center text-gray-500 text-sm mt-1">
                    <Icon path="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" className="w-4 h-4 mr-1" />
                    {booking.hoardingId?.location?.address}, {booking.hoardingId?.location?.city}
                  </div>
                </div>
                <Link 
                  to={`/hoardings/${booking.hoardingId?._id}`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Hoarding →
                </Link>
              </div>

              {/* Hoarding Image */}
              {booking.hoardingId?.media?.[0] && (
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
                  <img
                    src={booking.hoardingId.media[0].url}
                    alt={booking.hoardingId.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Hoarding Specs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Type</div>
                  <div className="font-medium">{booking.hoardingId?.mediaType || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-gray-500">Size</div>
                  <div className="font-medium">
                    {booking.hoardingId?.specs?.width && booking.hoardingId?.specs?.height 
                      ? `${booking.hoardingId.specs.width} × ${booking.hoardingId.specs.height} ${booking.hoardingId.specs.units}`
                      : 'N/A'
                    }
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Illumination</div>
                  <div className="font-medium">{booking.hoardingId?.specs?.illumination || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-gray-500">Rating</div>
                  <div className="font-medium">
                    {booking.hoardingId?.averageRating ? `${booking.hoardingId.averageRating.toFixed(1)}/5` : 'New'}
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Booking Period</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Icon path="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" className="w-4 h-4 text-gray-400" />
                      <span>Start: {startDate.toLocaleDateString('en-IN', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric' 
                      })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon path="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" className="w-4 h-4 text-gray-400" />
                      <span>End: {endDate.toLocaleDateString('en-IN', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric' 
                      })}</span>
                    </div>
                    <div className="text-gray-600">Duration: {duration} days</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Pricing Details</h4>
                  <div className="space-y-1 text-sm">
                    <div>Base Price: <span className="font-semibold">₹{booking.pricing?.basePrice?.toLocaleString('en-IN')}/{booking.pricing?.per}</span></div>
                    {booking.pricing?.additionalCosts?.map((cost, index) => (
                      <div key={index} className="text-gray-600">
                        {cost.name}: ₹{cost.cost?.toLocaleString('en-IN')} {cost.isIncluded ? '(Included)' : ''}
                      </div>
                    ))}
                    <div className="border-t pt-1 mt-2">
                      <div className="font-semibold text-lg">
                        Total: ₹{booking.pricing?.totalPrice?.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {booking.notes && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                  <p className="text-sm text-gray-600">{booking.notes}</p>
                </div>
              )}
            </div>

            {/* Proof Images */}
            {booking.proof?.images?.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Proof of Display</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {booking.proof.images.map((image, index) => (
                    <div key={index} className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={image.url}
                        alt={`Proof ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                        {new Date(image.uploadedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
                {booking.proof.notes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">{booking.proof.notes}</div>
                  </div>
                )}
              </div>
            )}

            {/* Installation Details */}
            {booking.installation && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Installation Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <InstallationBadge status={booking.installation.status} />
                  </div>
                  {booking.installation.scheduledDate && (
                    <div className="flex items-center gap-2 text-sm">
                      <Icon path="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" className="w-4 h-4 text-gray-400" />
                      <span>Scheduled for: {new Date(booking.installation.scheduledDate).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {booking.installation.completedDate && (
                    <div className="flex items-center gap-2 text-sm">
                      <Icon path="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" className="w-4 h-4 text-green-500" />
                      <span>Completed on: {new Date(booking.installation.completedDate).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {booking.installation.notes && (
                    <div className="text-sm">
                      <div className="font-medium text-gray-900 mb-1">Notes:</div>
                      <div className="text-gray-600">{booking.installation.notes}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Verification Details */}
            {booking.verification && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <VerificationBadge status={booking.verification.status} />
                  </div>
                  {booking.verification.verifiedBy && (
                    <div className="text-sm">
                      <span className="text-gray-600">Verified by:</span>
                      <span className="ml-2 font-medium">{booking.verification.verifiedBy.firstName} {booking.verification.verifiedBy.lastName}</span>
                    </div>
                  )}
                  {booking.verification.verifiedAt && (
                    <div className="flex items-center gap-2 text-sm">
                      <Icon path="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" className="w-4 h-4 text-gray-400" />
                      <span>Verified at: {new Date(booking.verification.verifiedAt).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {isBuyer ? 'Vendor Information' : 'Buyer Information'}
              </h3>
              
              {isBuyer && booking.vendorId && (
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-500">Name</div>
                    <div className="font-medium">
                      {booking.vendorId.firstName} {booking.vendorId.lastName}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <div className="font-medium">
                      <a href={`mailto:${booking.vendorId.email}`} className="text-blue-600 hover:underline">
                        {booking.vendorId.email}
                      </a>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Phone</div>
                    <div className="font-medium">
                      <a href={`tel:${booking.vendorId.phoneNumber}`} className="text-blue-600 hover:underline">
                        {booking.vendorId.phoneNumber || 'Not provided'}
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {isVendor && booking.buyerId && (
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-500">Name</div>
                    <div className="font-medium">
                      {booking.buyerId.firstName} {booking.buyerId.lastName}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <div className="font-medium">
                      <a href={`mailto:${booking.buyerId.email}`} className="text-blue-600 hover:underline">
                        {booking.buyerId.email}
                      </a>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Phone</div>
                    <div className="font-medium">
                      <a href={`tel:${booking.buyerId.phoneNumber}`} className="text-blue-600 hover:underline">
                        {booking.buyerId.phoneNumber || 'Not provided'}
                      </a>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t">
                <div className="text-sm text-gray-500">Booking Date</div>
                <div className="font-medium">{new Date(booking.createdAt).toLocaleDateString('en-IN')}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              
              {/* Vendor Actions */}
              {isVendor && (
                <div className="space-y-3">
                  {booking.status === 'pending' && (
                    <div className="flex gap-2">
                      <button 
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400" 
                        disabled={actionLoading} 
                        onClick={() => handleStatus('accepted')}
                      >
                        Accept
                      </button>
                      <button 
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:bg-gray-400" 
                        disabled={actionLoading} 
                        onClick={() => handleStatus('rejected')}
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {booking.status === 'accepted' && (
                    <div className="space-y-3">
                      {!showInstallationForm ? (
                        <button 
                          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400" 
                          disabled={actionLoading} 
                          onClick={() => setShowInstallationForm(true)}
                        >
                          Schedule Installation
                        </button>
                      ) : (
                        <form onSubmit={handleInstallationUpdate} className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date*</label>
                            <input 
                              type="datetime-local" 
                              value={installationForm.scheduledDate}
                              onChange={(e) => setInstallationForm(f => ({ ...f, scheduledDate: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              required 
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                            <textarea 
                              value={installationForm.notes}
                              onChange={(e) => setInstallationForm(f => ({ ...f, notes: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              rows={3}
                              placeholder="Any special instructions..."
                            />
                          </div>
                          <div className="flex gap-2">
                            <button 
                              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400" 
                              type="submit" 
                              disabled={actionLoading || !installationForm.scheduledDate}
                            >
                              Schedule
                            </button>
                            <button 
                              className="flex-1 bg-gray-200 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors" 
                              type="button" 
                              onClick={() => setShowInstallationForm(false)}
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      )}

                      {!showProofUpload ? (
                        <button 
                          className="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400" 
                          disabled={actionLoading} 
                          onClick={() => setShowProofUpload(true)}
                        >
                          Mark as Completed
                        </button>
                      ) : (
                        <form onSubmit={handleProofUpload} className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Proof*</label>
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleFileChange}
                              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                              required 
                            />
                            <p className="text-xs text-gray-500 mt-1">Upload a photo showing the hoarding with your advertisement displayed.</p>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400" 
                              type="submit" 
                              disabled={actionLoading || !proofFile}
                            >
                              Complete
                            </button>
                            <button 
                              className="flex-1 bg-gray-200 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors" 
                              type="button" 
                              onClick={() => {
                                setShowProofUpload(false);
                                setProofFile(null);
                                setError(null);
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Buyer Review Section */}
              {isBuyer && booking.status === 'completed' && (
                <div className="space-y-3">
                  {!review && !showReviewForm && (
                    <button 
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors" 
                      onClick={() => setShowReviewForm(true)}
                    >
                      Leave Review
                    </button>
                  )}
                  
                  {review && !showReviewForm && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <StarRating value={review.rating} readOnly size="text-lg" />
                        <span className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="text-sm text-gray-700 mb-2">
                        {review.comment || <span className="text-gray-400">No comment</span>}
                      </div>
                      <button 
                        className="text-blue-600 text-sm hover:underline" 
                        onClick={() => setShowReviewForm(true)}
                      >
                        Edit Review
                      </button>
                    </div>
                  )}
                  
                  {showReviewForm && (
                    <form onSubmit={handleReviewSubmit} className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Your Rating*</label>
                        <StarRating value={reviewForm.rating} onChange={r => setReviewForm(f => ({ ...f, rating: r }))} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                        <textarea 
                          value={reviewForm.comment} 
                          onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))} 
                          placeholder="Write your feedback (optional)" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          rows={3} 
                        />
                      </div>
                      <div className="flex gap-2">
                        <button 
                          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400" 
                          type="submit" 
                          disabled={actionLoading || !reviewForm.rating}
                        >
                          {review ? 'Update' : 'Submit'}
                        </button>
                        <button 
                          className="flex-1 bg-gray-200 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors" 
                          type="button" 
                          onClick={() => setShowReviewForm(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Cancel Booking Option */}
              {(booking.status === 'pending' || booking.status === 'accepted') && (
                <div className="pt-4 border-t">
                  <button 
                    className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors disabled:bg-gray-400" 
                    disabled={actionLoading} 
                    onClick={() => {
                      if (window.confirm('Are you sure you want to cancel this booking?')) {
                        handleStatus('cancelled');
                      }
                    }}
                  >
                    Cancel Booking
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 