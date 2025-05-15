const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
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
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  notes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  proofImage: {
    url: {
      type: String
    },
    key: {
      type: String
    }
  },
  proofUploadedAt: {
    type: Date
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

// Validate that endDate is after startDate
bookingSchema.pre('save', function(next) {
  if (this.endDate <= this.startDate) {
    next(new Error('End date must be after start date'));
  }
  next();
});

// Update the updatedAt timestamp
bookingSchema.pre('findOneAndUpdate', function() {
  this.set({ updatedAt: new Date() });
});

// Index for efficient querying
bookingSchema.index({ hoardingId: 1, startDate: 1, endDate: 1 });
bookingSchema.index({ buyerId: 1 });
bookingSchema.index({ status: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking; 