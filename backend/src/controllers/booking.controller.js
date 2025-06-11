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
      //console.log("booking is overlapping");
      return res.status(400).json({ message: 'Hoarding is already booked for these dates' });
    }

    // Calculate total price
    const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    const totalPrice = hoarding.price * days;

    const booking = new Booking({
      hoardingId,
      buyerId: req.user._id,
      startDate,
      endDate,
      notes,
      totalPrice
    });

    await booking.save();
    res.status(201).json({ message: 'Booking created successfully', booking });
  } catch (error) {
    res.status(500).json({ message: 'Error creating booking', error: error.message });
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
      .populate('hoardingId', 'name image location')
      .populate('buyerId', 'firstName lastName email phoneNumber')
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
    const hoarding = await Hoarding.findById(booking.hoardingId);
    
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
      if (hoarding.vendorId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this booking' });
      }
      // Validate status transition for vendor
      if (status === 'completed' && !req.file) {
        return res.status(400).json({ message: 'Proof image is required to complete booking' });
      }
    }

    booking.status = status;
    if (req.file) {
      booking.proofImage = {
        url: req.file.location,
        key: req.file.key
      };
      booking.proofUploadedAt = new Date();
    }
    await booking.save();

    res.json({ message: 'Booking status updated successfully', booking });
  } catch (error) {
    res.status(500).json({ message: 'Error updating booking status', error: error.message });
  }
};

// Upload proof of display
exports.uploadProof = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check authorization
    const hoarding = await Hoarding.findById(booking.hoardingId);
    if (hoarding.vendorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to upload proof for this booking' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Proof image is required' });
    }

    // Delete old proof image from S3 if exists
    if (booking.proofImage && booking.proofImage.key) {
      await s3Client.send(new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: booking.proofImage.key
      }));
    }

    booking.proofImage = {
      url: req.file.location,
      key: req.file.key
    };
    booking.proofUploadedAt = new Date();
    await booking.save();

    res.json({ message: 'Proof uploaded successfully', booking });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading proof', error: error.message });
  }
};

// Get booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('hoardingId', 'name image location')
      .populate('buyerId', 'username email phoneNumber');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check authorization
    const hoarding = await Hoarding.findById(booking.hoardingId);
    if (
      (req.user.role === 'buyer' && booking.buyerId._id.toString() !== req.user._id.toString()) ||
      (req.user.role === 'vendor' && hoarding.vendorId.toString() !== req.user._id.toString())
    ) {
      // console.log("Not authorized to view this booking");
      // console.log(req.user.role);
      // console.log("buyerId: ", booking.buyerId._id.toString());
      // console.log("userId: ", req.user._id.toString());
      // console.log("vendorId: ", hoarding.vendorId.toString());
      // console.log("userId: ", req.user._id.toString());
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