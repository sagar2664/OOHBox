const Hoarding = require('../models/hoarding.model');
const { s3Client } = require('../config/s3.config');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { validationResult } = require('express-validator');

// Create a new hoarding
exports.createHoarding = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' });
    }

    const hoarding = new Hoarding({
      ...req.body,
      vendorId: req.user._id,
      image: {
        url: req.file.location,
        key: req.file.key
      }
    });

    await hoarding.save();
    res.status(201).json({ message: 'Hoarding created successfully', hoarding });
  } catch (error) {
    res.status(500).json({ message: 'Error creating hoarding', error: error.message });
  }
};

// Get all hoardings with filters
exports.getHoardings = async (req, res) => {
  try {
    const {
      city,
      type,
      minPrice,
      maxPrice,
      status = 'approved',
      page = 1,
      limit = 10
    } = req.query;

    const query = { status };
    if (city) query['location.city'] = new RegExp(city, 'i');
    if (type) query['specs.type'] = type;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const hoardings = await Hoarding.find(query)
      .populate('vendorId', 'username email phoneNumber')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Hoarding.countDocuments(query);

    res.json({
      hoardings,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalHoardings: total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching hoardings', error: error.message });
  }
};

// Get hoarding by ID
exports.getHoardingById = async (req, res) => {
  try {
    const hoarding = await Hoarding.findById(req.params.id)
      .populate('vendorId', 'username email phoneNumber');

    if (!hoarding) {
      return res.status(404).json({ message: 'Hoarding not found' });
    }

    res.json(hoarding);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching hoarding', error: error.message });
  }
};

// Update hoarding
exports.updateHoarding = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const hoarding = await Hoarding.findById(req.params.id);
    if (!hoarding) {
      return res.status(404).json({ message: 'Hoarding not found' });
    }

    // Check ownership
    if (hoarding.vendorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this hoarding' });
    }

    const updates = { ...req.body };

    // Handle new image upload
    if (req.file) {
      // Delete old image from S3
      if (hoarding.image && hoarding.image.key) {
        await s3Client.send(new DeleteObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: hoarding.image.key
        }));
      }

      updates.image = {
        url: req.file.location,
        key: req.file.key
      };
    }

    const updatedHoarding = await Hoarding.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({ message: 'Hoarding updated successfully', hoarding: updatedHoarding });
  } catch (error) {
    res.status(500).json({ message: 'Error updating hoarding', error: error.message });
  }
};

// Delete hoarding
exports.deleteHoarding = async (req, res) => {
  try {
    const hoarding = await Hoarding.findById(req.params.id);
    if (!hoarding) {
      return res.status(404).json({ message: 'Hoarding not found' });
    }

    // Check ownership
    if (hoarding.vendorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this hoarding' });
    }

    // Delete image from S3
    if (hoarding.image && hoarding.image.key) {
      await s3Client.send(new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: hoarding.image.key
      }));
    }

    await hoarding.remove();
    res.json({ message: 'Hoarding deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting hoarding', error: error.message });
  }
};

// Get vendor's hoardings
exports.getMyHoardings = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const hoardings = await Hoarding.find({ vendorId: req.user._id })
      .populate('vendorId', 'username email phoneNumber')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Hoarding.countDocuments({ vendorId: req.user._id });

    res.json({
      hoardings,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalHoardings: total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching your hoardings', error: error.message });
  }
};

// Approve/reject hoarding (admin only)
exports.updateHoardingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const hoarding = await Hoarding.findById(req.params.id);
    if (!hoarding) {
      return res.status(404).json({ message: 'Hoarding not found' });
    }

    if (hoarding.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending hoardings can be approved or rejected' });
    }

    hoarding.status = status;
    await hoarding.save();

    res.json({ message: `Hoarding ${status} successfully`, hoarding });
  } catch (error) {
    res.status(500).json({ message: 'Error updating hoarding status', error: error.message });
  }
}; 