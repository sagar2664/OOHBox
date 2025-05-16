const mongoose = require('mongoose');

const hoardingSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    url: {
      type: String,
      required: true
    },
    key: {
      type: String,
      required: true
    }
  },
  specs: {
    width: {
      type: Number,
      required: true
    },
    height: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: ['billboard', 'digital', 'wall', 'other']
    }
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  location: {
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: true
      }
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
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

// Index for geospatial queries
hoardingSchema.index({ 'location.coordinates': '2dsphere' });

// Update the updatedAt timestamp
hoardingSchema.pre('findOneAndUpdate', function() {
  this.set({ updatedAt: new Date() });
});

const Hoarding = mongoose.model('Hoarding', hoardingSchema);

module.exports = Hoarding; 