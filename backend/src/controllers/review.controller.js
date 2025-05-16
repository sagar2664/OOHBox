const Review = require('../models/review.model');
const Booking = require('../models/booking.model');
const { validationResult } = require('express-validator');

// Create a new review
exports.createReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { hoardingId, bookingId, rating, comment } = req.body;

    // Check if booking exists and is completed
    const booking = await Booking.findOne({
      _id: bookingId,
      hoardingId,
      buyerId: req.user._id,
      status: 'completed'
    });

    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found, not completed, or not authorized to review'
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return res.status(400).json({ message: 'Review already exists for this booking' });
    }

    const review = new Review({
      hoardingId,
      buyerId: req.user._id,
      bookingId,
      rating,
      comment
    });

    await review.save();
    res.status(201).json({ message: 'Review created successfully', review });
  } catch (error) {
    res.status(500).json({ message: 'Error creating review', error: error.message });
  }
};

// Get reviews for a hoarding
exports.getHoardingReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const hoardingId = req.params.hoardingId;

    const reviews = await Review.find({ hoardingId })
      .populate('buyerId', 'firstName lastName')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Review.countDocuments({ hoardingId });

    res.json({
      reviews,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalReviews: total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
};

// Update review
exports.updateReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rating, comment } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check ownership
    if (review.buyerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }

    review.rating = rating;
    review.comment = comment;
    await review.save();

    res.json({ message: 'Review updated successfully', review });
  } catch (error) {
    res.status(500).json({ message: 'Error updating review', error: error.message });
  }
};

// Delete review
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check ownership
    if (review.buyerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    await review.remove();
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting review', error: error.message });
  }
}; 