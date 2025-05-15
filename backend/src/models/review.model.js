const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  hoardingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hoarding',
    required: true
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    unique: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp
reviewSchema.pre('findOneAndUpdate', function() {
  this.set({ updatedAt: new Date() });
});

// Create indexes
reviewSchema.index({ hoardingId: 1 });
reviewSchema.index({ buyerId: 1 });

// Middleware to update hoarding's average rating and review count
reviewSchema.post('save', async function() {
  const Hoarding = mongoose.model('Hoarding');
  const Review = mongoose.model('Review');
  
  const stats = await Review.aggregate([
    { $match: { hoardingId: this.hoardingId } },
    {
      $group: {
        _id: '$hoardingId',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await Hoarding.findByIdAndUpdate(this.hoardingId, {
      averageRating: stats[0].averageRating,
      reviewCount: stats[0].reviewCount
    });
  }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review; 