const Hoarding = require('../models/hoarding.model');
const { validationResult } = require('express-validator');

// Create a new hoarding
exports.createHoarding = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { imageData, ...rest } = req.body;
    if (!imageData) {
      return res.status(400).json({ message: 'Image data is required' });
    }

    const hoarding = new Hoarding({
      ...rest,
      ownerId: req.user._id,
      imageData: Buffer.from(imageData, 'base64')
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
      .populate('ownerId', 'username email phoneNumber')
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
      .populate('ownerId', 'username email phoneNumber');

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
    if (hoarding.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this hoarding' });
    }

    const { imageData, ...updates } = req.body;
    if (imageData) updates.imageData = Buffer.from(imageData, 'base64');

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
    if (hoarding.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this hoarding' });
    }

    await hoarding.remove();
    res.json({ message: 'Hoarding deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting hoarding', error: error.message });
  }
};

// Get owner's hoardings
exports.getMyHoardings = async (req, res) => {
  try {
    const hoardings = await Hoarding.find({ ownerId: req.user._id })
      .sort({ createdAt: -1 });

    res.json(hoardings);
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

    const hoarding = await Hoarding.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!hoarding) {
      return res.status(404).json({ message: 'Hoarding not found' });
    }

    res.json({ message: `Hoarding ${status} successfully`, hoarding });
  } catch (error) {
    res.status(500).json({ message: 'Error updating hoarding status', error: error.message });
  }
}; 