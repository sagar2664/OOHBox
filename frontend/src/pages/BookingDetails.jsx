import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  getBookingById,
  updateBookingStatus,
  uploadBookingProof,
  createReview,
  updateReview,
  getReviewByBookingId
} from '../api/api';

function StatusBadge({ status }) {
  const map = {
    pending: 'bg-yellow-100 text-yellow-700',
    accepted: 'bg-blue-100 text-blue-700',
    rejected: 'bg-red-100 text-red-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-gray-100 text-gray-700',
  };
  return <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${map[status] || 'bg-gray-200 text-gray-600'}`}>{status?.charAt(0).toUpperCase() + status?.slice(1)}</span>;
}

function StarRating({ value, onChange, readOnly }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          className={`text-xl ${star <= value ? 'text-yellow-400' : 'text-gray-300'}`}
          onClick={() => !readOnly && onChange(star)}
          disabled={readOnly}
        >★</button>
      ))}
    </div>
  );
}

export default function BookingDetails() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [review, setReview] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '' });
  const [proofFile, setProofFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showProofUpload, setShowProofUpload] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  // Fetch booking data
  const fetchBookingData = async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    try {
      const b = await getBookingById(id, token);
      setBooking(b);
      
      // Only fetch review if buyer and completed
      if (user?.role === 'buyer' && b.status === 'completed') {
        const r = await getReviewByBookingId(b.hoardingId._id, b._id);
        setReview(r);
        if (r) setReviewForm({ rating: r.rating, comment: r.comment || '' });
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
        console.log('Starting proof upload and status update process...');
        console.log('Proof file:', proofFile);
        console.log('File type:', proofFile?.type);
        console.log('File size:', proofFile?.size);
        
        // Send both proof and status update in a single call
        console.log('Attempting to update status and upload proof...');
        const response = await updateBookingStatus(id, status, token, proofFile);
        console.log('Status update and proof upload response:', response);
      } else {
        // For other status updates, just update the status
        console.log('Updating status to:', status);
        await updateBookingStatus(id, status, token);
      }
      
      console.log('Fetching updated booking data...');
      await fetchBookingData();
      setProofFile(null);
      setShowProofUpload(false);
      setSuccessMessage(`Booking ${status} successfully`);
    } catch (err) {
      console.error('Error in handleStatus:', err);
      setError(err.message);
      if (err.message.includes('not authenticated')) {
        navigate('/login');
      }
    } finally {
      setActionLoading(false);
    }
  };

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
      console.log('Starting proof upload...');
      console.log('Proof file:', proofFile);
      console.log('File type:', proofFile.type);
      console.log('File size:', proofFile.size);
      
      const response = await uploadBookingProof(id, proofFile, token);
      console.log('Proof upload response:', response);
      
      await fetchBookingData();
      setProofFile(null);
      setShowProofUpload(false);
      setSuccessMessage('Proof uploaded successfully');
    } catch (err) {
      console.error('Error in handleProofUpload:', err);
      setError(err.message);
      if (err.message.includes('not authenticated')) {
        navigate('/login');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('File selected:', file);
      console.log('File type:', file.type);
      console.log('File size:', file.size);
      setProofFile(file);
      setError(null);
    }
  };

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
      if (err.message.includes('not authenticated')) {
        navigate('/login');
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (!booking) return <div className="text-center py-8 text-red-600">Booking not found</div>;

  const isBuyer = user?.role === 'buyer';
  const isVendor = user?.role === 'vendor';

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Booking Details</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      <div className="bg-white rounded shadow p-6 flex flex-col gap-6">
        {/* Hoarding Information */}
        <div className="flex flex-col md:flex-row md:items-center md:gap-8 gap-2">
          <div className="flex-1">
            <div className="font-semibold text-lg">{booking.hoardingId?.name}</div>
            <div className="text-sm text-gray-500">{booking.hoardingId?.location?.address}, {booking.hoardingId?.location?.city}, {booking.hoardingId?.location?.state}</div>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        {/* Vendor Information - Only visible to buyers */}
        {isBuyer && (
          <div className="bg-gray-50 rounded p-4">
            <h2 className="font-semibold text-lg mb-3">Vendor Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">Name</div>
                <div className="font-medium">{booking.hoardingId?.vendorId?.firstName} {booking.hoardingId?.vendorId?.lastName}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Email</div>
                <div className="font-medium">
                  <a href={`mailto:${booking.hoardingId?.vendorId?.email}`} className="text-blue-600 hover:underline">
                    {booking.hoardingId?.vendorId?.email}
                  </a>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Phone</div>
                <div className="font-medium">
                  <a href={`tel:${booking.hoardingId?.vendorId?.phoneNumber}`} className="text-blue-600 hover:underline">
                    {booking.hoardingId?.vendorId?.phoneNumber || 'Not provided'}
                  </a>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Booking Date</div>
                <div className="font-medium">{new Date(booking.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        )}

        {/* Buyer Information - Only visible to vendors */}
        {isVendor && (
          <div className="bg-gray-50 rounded p-4">
            <h2 className="font-semibold text-lg mb-3">Buyer Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">Name</div>
                <div className="font-medium">{booking.buyerId?.firstName} {booking.buyerId?.lastName}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Email</div>
                <div className="font-medium">
                  <a href={`mailto:${booking.buyerId?.email}`} className="text-blue-600 hover:underline">
                    {booking.buyerId?.email}
                  </a>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Phone</div>
                <div className="font-medium">
                  <a href={`tel:${booking.buyerId?.phoneNumber}`} className="text-blue-600 hover:underline">
                    {booking.buyerId?.phoneNumber || 'Not provided'}
                  </a>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Booking Date</div>
                <div className="font-medium">{new Date(booking.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        )}

        {/* Booking Details */}
        <div className="bg-gray-50 rounded p-4">
          <h2 className="font-semibold text-lg mb-3">Booking Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500">Start Date</div>
              <div className="font-medium">{new Date(booking.startDate).toLocaleDateString()}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">End Date</div>
              <div className="font-medium">{new Date(booking.endDate).toLocaleDateString()}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Total Price</div>
              <div className="font-medium">₹{booking.totalPrice}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Notes</div>
              <div className="font-medium">{booking.notes || '-'}</div>
            </div>
          </div>
        </div>

        {/* Proof Image Section - Visible to both buyer and vendor */}
        {booking.proofImage?.url && (
          <div className="bg-gray-50 rounded p-4">
            <h2 className="font-semibold text-lg mb-3">Proof of Display</h2>
            <img 
              src={booking.proofImage.url} 
              alt="Proof of display" 
              className="max-h-64 rounded shadow"
            />
            <div className="text-sm text-gray-500 mt-2">
              Uploaded on {new Date(booking.proofUploadedAt).toLocaleDateString()}
            </div>
          </div>
        )}

        {/* Vendor Actions */}
        {isVendor && (
          <div className="flex flex-col gap-4">
            {booking.status === 'pending' && (
              <div className="flex gap-2">
                <button 
                  className="bg-green-600 text-white px-4 py-2 rounded font-medium hover:bg-green-700 transition" 
                  disabled={actionLoading} 
                  onClick={() => handleStatus('accepted')}
                >
                  Accept Booking
                </button>
                <button 
                  className="bg-red-600 text-white px-4 py-2 rounded font-medium hover:bg-red-700 transition" 
                  disabled={actionLoading} 
                  onClick={() => handleStatus('rejected')}
                >
                  Reject Booking
                </button>
              </div>
            )}

            {booking.status === 'accepted' && (
              <div className="flex flex-col gap-4">
                {!showProofUpload ? (
                  <button 
                    className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 transition" 
                    disabled={actionLoading} 
                    onClick={() => setShowProofUpload(true)}
                  >
                    Mark as Completed
                  </button>
                ) : (
                  <form className="flex flex-col gap-3" onSubmit={(e) => {
                    e.preventDefault();
                    handleStatus('completed');
                  }}>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Upload Proof of Display*</label>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        required 
                      />
                      <p className="text-sm text-gray-500 mt-1">Please upload a photo showing the hoarding with your advertisement displayed.</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 transition" 
                        type="submit" 
                        disabled={actionLoading || !proofFile}
                      >
                        Complete Booking
                      </button>
                      <button 
                        className="bg-gray-200 px-4 py-2 rounded font-medium hover:bg-gray-300 transition" 
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
          <div className="mt-4">
            {!review && !showReviewForm && (
              <button 
                className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 transition" 
                onClick={() => setShowReviewForm(true)}
              >
                Leave Review
              </button>
            )}
            {review && !showReviewForm && (
              <div className="bg-gray-50 rounded p-4">
                <div className="flex items-center gap-2">
                  <StarRating value={review.rating} readOnly />
                  <span className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="mt-2">{review.comment || <span className="text-gray-400">No comment</span>}</div>
                <button 
                  className="mt-2 text-blue-600 text-sm hover:underline" 
                  onClick={() => setShowReviewForm(true)}
                >
                  Edit Review
                </button>
              </div>
            )}
            {showReviewForm && (
              <form className="bg-gray-50 rounded p-4 mt-2 flex flex-col gap-3" onSubmit={handleReviewSubmit}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Rating*</label>
                  <StarRating value={reviewForm.rating} onChange={r => setReviewForm(f => ({ ...f, rating: r }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                  <textarea 
                    className="w-full border rounded px-3 py-2" 
                    value={reviewForm.comment} 
                    onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))} 
                    placeholder="Write your feedback (optional)" 
                    rows={3} 
                  />
                </div>
                <div className="flex gap-2">
                  <button 
                    className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 transition" 
                    type="submit" 
                    disabled={actionLoading || !reviewForm.rating}
                  >
                    {review ? 'Update Review' : 'Submit Review'}
                  </button>
                  <button 
                    className="bg-gray-200 px-4 py-2 rounded font-medium hover:bg-gray-300 transition" 
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
          <button 
            className="bg-gray-600 text-white px-4 py-2 rounded font-medium hover:bg-gray-700 transition" 
            disabled={actionLoading} 
            onClick={() => handleStatus('cancelled')}
          >
            Cancel Booking
          </button>
        )}
      </div>
    </div>
  );
} 