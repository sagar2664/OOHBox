const Booking = require('../models/booking.model');
const Hoarding = require('../models/hoarding.model');
const { validationResult } = require('express-validator');
const { s3Client } = require('../config/s3.config');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { hoardingId, startDate, endDate, notes } = req.body;

    // Check if hoarding exists and is approved
    const hoarding = await Hoarding.findOne({ _id: hoardingId, status: 'approved' });
    if (!hoarding) {
      return res.status(404).json({ message: 'Hoarding not found or not approved' });
    }

    // Check for overlapping bookings
    const overlappingBooking = await Booking.findOne({
      hoardingId,
      status: { $in: ['pending', 'accepted'] },
      $or: [
        {
          startDate: { $lte: new Date(endDate) },
          endDate: { $gte: new Date(startDate) }
        }
      ]
    });

    if (overlappingBooking) {
      return res.status(400).json({ message: 'Hoarding is already booked for these dates' });
    }

    // Calculate total price
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    
    if (!hoarding.pricing || !hoarding.pricing.basePrice) {
      return res.status(400).json({ message: 'Hoarding pricing information is missing' });
    }

    // Calculate total price based on pricing period
    let totalPrice = hoarding.pricing.basePrice;
    if (hoarding.pricing.per === 'day') {
      totalPrice = hoarding.pricing.basePrice * days;
    } else if (hoarding.pricing.per === 'week') {
      totalPrice = hoarding.pricing.basePrice * Math.ceil(days / 7);
    } else if (hoarding.pricing.per === 'month') {
      totalPrice = hoarding.pricing.basePrice * Math.ceil(days / 30);
    }

    // Add additional costs
    if (hoarding.pricing.additionalCosts) {
      hoarding.pricing.additionalCosts.forEach(cost => {
        if (cost.isIncluded) {
          totalPrice += cost.cost;
        }
      });
    }

    const booking = new Booking({
      hoardingId,
      buyerId: req.user._id,
      vendorId: hoarding.vendorId,
      startDate: start,
      endDate: end,
      notes,
      pricing: {
        basePrice: hoarding.pricing.basePrice,
        per: hoarding.pricing.per,
        additionalCosts: hoarding.pricing.additionalCosts || [],
        totalPrice: totalPrice
      }
    });

    await booking.save();

    // Update hoarding's bookings array
    await Hoarding.findByIdAndUpdate(hoardingId, {
      $push: {
        bookings: {
          bookingId: booking._id,
          startDate: start,
          endDate: end
        }
      }
    });

    res.status(201).json({ message: 'Booking created successfully', booking });
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({ 
      message: 'Error creating booking', 
      error: error.message,
      details: error.stack
    });
  }
};

// Get user's bookings
exports.getMyBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = {};

    if (req.user.role === 'buyer') {
      query.buyerId = req.user._id;
    } else if (req.user.role === 'vendor') {
      const hoardings = await Hoarding.find({ vendorId: req.user._id });
      query.hoardingId = { $in: hoardings.map(h => h._id) };
    }

    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('hoardingId', 'name media location mediaType specs averageRating')
      .populate('buyerId', 'firstName lastName email phoneNumber')
      .populate('vendorId', 'firstName lastName email phoneNumber')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Booking.countDocuments(query);

    res.json({
      bookings,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalBookings: total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
};

// Update booking status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'rejected', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check authorization and validate status changes
    // Handle buyer cancellation
    if (req.user.role === 'buyer') {
      if (booking.buyerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this booking' });
      }
      // Buyers can only cancel pending bookings
      if (status !== 'cancelled' || booking.status !== 'pending') {
        return res.status(403).json({ message: 'Buyers can only cancel pending bookings' });
      }
    }
    // Handle vendor status updates
    else if (req.user.role === 'vendor') {
      if (booking.vendorId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this booking' });
      }
      // Validate status transition for vendor
      if (status === 'completed') {
        if (!booking.proof || !booking.proof.images || booking.proof.images.length === 0) {
          return res.status(400).json({ message: 'At least one proof image is required to complete booking' });
        }
      }
    }

    booking.status = status;
    await booking.save();

    res.json({ message: 'Booking status updated successfully', booking });
  } catch (error) {
    res.status(500).json({ message: 'Error updating booking status', error: error.message });
  }
};

// Upload proof of display (multiple images)
exports.uploadProof = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check authorization
    if (booking.vendorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to upload proof for this booking' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'At least one proof image is required' });
    }

    // Add new proof images
    req.files.forEach(file => {
      booking.proof.images.push({
        url: file.location,
        key: file.key,
        uploadedAt: new Date()
      });
    });

    // Optionally handle notes
    if (req.body.notes) {
      booking.proof.notes = req.body.notes;
    }

    await booking.save();

    res.json({ message: 'Proof uploaded successfully', proof: booking.proof });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading proof', error: error.message });
  }
};

// Get booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('hoardingId', 'name media location mediaType specs averageRating')
      .populate('buyerId', 'firstName lastName email phoneNumber')
      .populate('vendorId', 'firstName lastName email phoneNumber');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check authorization
    if (
      (req.user.role === 'buyer' && booking.buyerId._id.toString() !== req.user._id.toString()) ||
      (req.user.role === 'vendor' && booking.vendorId._id.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching booking', error: error.message });
  }
};

// Get bookings for a specific hoarding (for availability calendar)
exports.getBookingsForHoarding = async (req, res) => {
  try {
    const bookings = await Booking.find({
      hoardingId: req.params.hoardingId,
      status: { $in: ['pending', 'accepted'] }
    }).select('startDate endDate status');
    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
};

// Update installation details
exports.updateInstallation = async (req, res) => {
  try {
    console.log(req.body);
    const { scheduledDate, status, notes } = req.body;
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check authorization
    if (booking.vendorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update installation details' });
    }

    // Update installation details
    booking.installation = {
      ...booking.installation,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : booking.installation.scheduledDate,
      status: status || booking.installation.status,
      notes: notes || booking.installation.notes
    };

    // If installation is completed, update the completedDate
    if (status === 'Completed' && !booking.installation.completedDate) {
      booking.installation.completedDate = new Date();
    }

    await booking.save();
    res.json({ message: 'Installation details updated successfully', booking });
  } catch (error) {
    res.status(500).json({ message: 'Error updating installation details', error: error.message });
  }
};

// Update verification status
exports.updateVerification = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Update verification details
    booking.verification = {
      status,
      verifiedBy: req.user._id,
      verifiedAt: new Date()
    };

    if (notes) {
      booking.verification.notes = notes;
    }

    await booking.save();
    res.json({ message: 'Verification status updated successfully', booking });
  } catch (error) {
    res.status(500).json({ message: 'Error updating verification status', error: error.message });
  }
};

module.exports = exports; 