const Hoarding = require('../models/hoarding.model');
const { s3Client } = require('../config/s3.config');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

// Generate a unique hoarding ID
const generateHoardingId = (city) => {
    const prefix = city.substring(0, 3).toUpperCase();
    const uniqueId = uuidv4().substring(0, 6).toUpperCase();
    return `${prefix}-${uniqueId}`;
};

// Create a new hoarding
exports.createHoarding = async (req, res) => {
    try {
        //console.log(req.body);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'At least one media file is required' });
        }

        // Generate hoarding ID
        const hoardingId = generateHoardingId(req.body.location.city);

        // Process media files
        const media = req.files.map(file => ({
            mediaType: file.mimetype.startsWith('image/') ? 'image' : 
                      file.mimetype.startsWith('video/') ? 'video' : '360-view',
            url: file.location,
            key: file.key,
            caption: req.body.mediaCaptions?.[file.key] || ''
        }));

        const hoarding = new Hoarding({
            ...req.body,
            hoardingId,
            vendorId: req.user._id,
            media,
            verification: {
                status: 'Pending',
                verifiedBy: null,
                verifiedAt: null
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
            mediaType,
            minPrice,
            maxPrice,
            status = 'approved',
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const query = { status };
        if (city) query['location.city'] = new RegExp(city, 'i');
        if (mediaType) query.mediaType = mediaType;
        if (minPrice || maxPrice) {
            query['pricing.basePrice'] = {};
            if (minPrice) query['pricing.basePrice'].$gte = Number(minPrice);
            if (maxPrice) query['pricing.basePrice'].$lte = Number(maxPrice);
        }

        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const hoardings = await Hoarding.find(query)
            .populate('vendorId', 'firstName lastName email phoneNumber')
            .populate('reviews')
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .sort(sort);

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
            .populate('vendorId', 'firstName lastName email phoneNumber')
            .populate('reviews')
            .populate('bookings.bookingId');

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
        console.log('Request body:', req.body);

        // Handle new media uploads
        if (req.files && req.files.length > 0) {
            const newMedia = req.files.map(file => ({
                mediaType: file.mimetype.startsWith('image/') ? 'image' : 
                          file.mimetype.startsWith('video/') ? 'video' : '360-view',
                url: file.location,
                key: file.key,
                caption: req.body.mediaCaptions?.[file.key] || ''
            }));

            // Combine existing media with new media
            updates.media = [...hoarding.media, ...newMedia];
            console.log('Updated media array after new uploads:', updates.media);
        }

        const updatedHoarding = await Hoarding.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        console.log('Final updated hoarding:', updatedHoarding);
        res.json({ message: 'Hoarding updated successfully', hoarding: updatedHoarding });
    } catch (error) {
        console.error('Error in updateHoarding:', error);
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

        // Delete hoarding from database without deleting media from S3
        await Hoarding.findByIdAndDelete(req.params.id);
        res.json({ message: 'Hoarding deleted successfully' });
    } catch (error) {
        console.error('Error in deleteHoarding:', error);
        res.status(500).json({ message: 'Error deleting hoarding', error: error.message });
    }
};

// Get vendor's hoardings
exports.getMyHoardings = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const query = { vendorId: req.user._id };
        
        if (status) {
            query.status = status;
        }

        const hoardings = await Hoarding.find(query)
            .populate('vendorId', 'username email phoneNumber')
            .populate('reviews')
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
        res.status(500).json({ message: 'Error fetching your hoardings', error: error.message });
    }
};

// Update hoarding status (admin only)
exports.updateHoardingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['approved', 'rejected', 'booked', 'unavailable'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const hoarding = await Hoarding.findById(req.params.id);
        if (!hoarding) {
            return res.status(404).json({ message: 'Hoarding not found' });
        }

        hoarding.status = status;
        if (status === 'approved') {
            hoarding.verification = {
                status: 'Verified',
                verifiedBy: req.user._id,
                verifiedAt: new Date()
            };
        }

        await hoarding.save();
        res.json({ message: `Hoarding ${status} successfully`, hoarding });
    } catch (error) {
        res.status(500).json({ message: 'Error updating hoarding status', error: error.message });
    }
};

// Update hoarding verification status (admin only)
exports.updateVerificationStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['Verified', 'Unverified', 'Pending'].includes(status)) {
            return res.status(400).json({ message: 'Invalid verification status' });
        }

        const hoarding = await Hoarding.findById(req.params.id);
        if (!hoarding) {
            return res.status(404).json({ message: 'Hoarding not found' });
        }

        hoarding.verification = {
            status,
            verifiedBy: req.user._id,
            verifiedAt: new Date()
        };

        await hoarding.save();
        res.json({ message: `Hoarding verification status updated to ${status}`, hoarding });
    } catch (error) {
        res.status(500).json({ message: 'Error updating verification status', error: error.message });
    }
};

// Update legal status (vendor only)
exports.updateLegalStatus = async (req, res) => {
    try {
        const { permitStatus, permitId, permitExpiryDate } = req.body;
        
        const hoarding = await Hoarding.findById(req.params.id);
        if (!hoarding) {
            return res.status(404).json({ message: 'Hoarding not found' });
        }

        // Check ownership
        if (hoarding.vendorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this hoarding' });
        }

        hoarding.legal = {
            permitStatus,
            permitId,
            permitExpiryDate,
            permitDocumentUrl: req.file ? req.file.location : hoarding.legal?.permitDocumentUrl
        };

        await hoarding.save();
        res.json({ message: 'Legal status updated successfully', hoarding });
    } catch (error) {
        res.status(500).json({ message: 'Error updating legal status', error: error.message });
    }
}; 