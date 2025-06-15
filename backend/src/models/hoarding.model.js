const mongoose = require('mongoose');

const hoardingSchema = new mongoose.Schema({
    // --- Core Identification ---
    hoardingId: {
        type: String,
        unique: true,
        required: true,
    },
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    name: {
        type: String,
        required: [true, 'Hoarding name or title is required.'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'A detailed description is required.']
    },
    mediaType: {
        type: String,
        required: true,
        enum: ['Static Billboard', 'Digital OOH (DOOH)', 'Transit', 'Street Furniture', 'Wallscape', 'Gantry', 'Other'],
        default: 'Static Billboard'
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'booked', 'unavailable'],
        default: 'pending',
        index: true
    },
    tags: {
        type: [String],
        enum: ['Frequently Booked', 'Popular', 'Filling Fast', 'New Listing'],
        default: []
    },

    // --- Location Details ---
    location: {
        address: {
            type: String,
            required: [true, 'Street address is required.']
        },
        landmark: {
            type: String
        },
        area: {
            type: String,
            required: [true, 'Area or neighborhood is required.']
        },
        city: {
            type: String,
            required: true,
            index: true
        },
        state: {
            type: String,
            required: true
        },
        coordinates: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point',
                required: true
            },
            coordinates: {
                type: [Number],
                required: true
            }
        }
    },

    // --- Physical & Technical Specifications ---
    specs: {
        width: {
            type: Number,
            required: [true, 'Width of the hoarding is required.']
        },
        height: {
            type: Number,
            required: [true, 'Height of the hoarding is required.']
        },
        units: {
            type: String,
            enum: ['ft', 'm'],
            default: 'ft'
        },
        aspectRatio: {
            type: String,
        },
        orientation: {
            type: String,
            trim: true
        },
        illumination: {
            type: String,
            enum: ['Backlit', 'Frontlit', 'Digital', 'Non-Illuminated']
        }
    },

    // --- DOOH Specifics ---
    digitalSpecs: {
        resolution: {
            type: String,
        },
        pixelDimensions: {
            width: Number,
            height: Number
        }
    },
    
    // --- Media Gallery ---
    media: [{
        mediaType: {
            type: String,
            enum: ['image', 'video', '360-view'],
            required: true,
        },
        url: {
            type: String,
            required: true
        },
        key: {
            type: String
        },
        caption: {
            type: String
        }
    }],

    // --- Pricing & Booking ---
    pricing: {
        basePrice: {
            type: Number,
            required: true,
            min: 0
        },
        per: {
            type: String,
            enum: ['day', 'week', 'month', 'slot'],
            default: 'month'
        },
        model: {
            type: String,
            enum: ['Flat Rate', 'Impression-based', 'Programmatic'],
            default: 'Flat Rate'
        },
        negotiable: {
            type: Boolean,
            default: false
        },
        additionalCosts: [{
            name: { type: String, required: true },
            cost: { type: Number, required: true },
            isIncluded: { type: Boolean, default: false }
        }]
    },
    
    // --- Availability & Bookings ---
    bookings: [{
        bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true }
    }],

    // --- Audience & Traffic Insights ---
    audience: {
        footfall: {
            volume: Number,
            period: { type: String, enum: ['daily', 'weekly'], default: 'daily' },
            source: String
        },
        demographics: [String],
        commutePatterns: [String],
        bestSuitedFor: [String],
        pointsOfInterest: [String]
    },

    // --- Legal & Verification ---
    verification: {
        status: {
            type: String,
            enum: ['Verified', 'Unverified', 'Pending'],
            default: 'Unverified'
        },
        verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        verifiedAt: { type: Date }
    },
    legal: {
        permitStatus: {
            type: String,
            enum: ['Approved', 'Pending', 'Expired', 'Not Required'],
            default: 'Pending'
        },
        permitId: String,
        permitExpiryDate: Date,
        permitDocumentUrl: String
    },

    // --- Installation Details ---
    installation: {
        leadTimeDays: {
            type: Number,
            min: 0
        },
        accessNotes: String
    },

    // --- Reviews & Ratings ---
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    }],
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
        set: val => Math.round(val * 10) / 10
    },
    reviewCount: {
        type: Number,
        default: 0
    },

}, {
    timestamps: true
});

// --- Schema Indexes ---
hoardingSchema.index({ 'location.coordinates': '2dsphere' });
hoardingSchema.index({ 'location.city': 1, 'status': 1, 'mediaType': 1 });

// --- Middleware ---
hoardingSchema.pre('save', function(next) {
    if (this.isModified('specs.width') || this.isModified('specs.height')) {
        if (this.specs.width && this.specs.height) {
            const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
            const commonDivisor = gcd(this.specs.width, this.specs.height);
            this.specs.aspectRatio = `${this.specs.width / commonDivisor}:${this.specs.height / commonDivisor}`;
        }
    }
    next();
});

const Hoarding = mongoose.model('Hoarding', hoardingSchema);

module.exports = Hoarding; 