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
  vendorId: {
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
    trim: true,
    maxLength: 500
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  pricing: {
    basePrice: {
      type: Number,
      required: true,
      min: 0
    },
    per: {
      type: String,
      enum: ['day', 'week', 'month', 'slot'],
      required: true
    },
    additionalCosts: [{
      name: { type: String, required: true },
      cost: { type: Number, required: true },
      isIncluded: { type: Boolean, default: false }
    }],
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    }
  },
  verification: {
    status: {
      type: String,
      enum: ['Pending', 'Verified', 'Rejected'],
      default: 'Pending'
    },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date }
  },
  proof: {
    images: [{
      url: { type: String, required: true },
      key: { type: String, required: true },
      uploadedAt: { type: Date, default: Date.now }
    }],
    notes: { type: String, trim: true }
  },
  installation: {
    scheduledDate: { type: Date },
    completedDate: { type: Date },
    status: {
      type: String,
      enum: ['Pending', 'Scheduled', 'Completed', 'Cancelled'],
      default: 'Pending'
    },
    notes: { type: String, trim: true }
  }
}, {
  timestamps: true
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

// Indexes for efficient querying
bookingSchema.index({ hoardingId: 1, startDate: 1, endDate: 1 });
bookingSchema.index({ buyerId: 1 });
bookingSchema.index({ vendorId: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ 'verification.status': 1 });
bookingSchema.index({ 'installation.status': 1 });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking; 