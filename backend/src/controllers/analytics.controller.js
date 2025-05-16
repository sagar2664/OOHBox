const Booking = require('../models/booking.model');
const Hoarding = require('../models/hoarding.model');
const User = require('../models/user.model');
const Review = require('../models/review.model');

// Get vendor analytics
exports.getVendorAnalytics = async (req, res) => {
  try {
    const vendorId = req.user._id;

    // Get vendor's hoardings
    const hoardings = await Hoarding.find({ vendorId });
    const hoardingIds = hoardings.map(h => h._id);

    // Get booking statistics
    const bookingStats = await Booking.aggregate([
      {
        $match: {
          hoardingId: { $in: hoardingIds }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' }
        }
      }
    ]);

    // Get monthly revenue
    const monthlyRevenue = await Booking.aggregate([
      {
        $match: {
          hoardingId: { $in: hoardingIds },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalPrice' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Get hoarding performance
    const hoardingPerformance = await Hoarding.aggregate([
      {
        $match: { _id: { $in: hoardingIds } }
      },
      {
        $lookup: {
          from: 'bookings',
          localField: '_id',
          foreignField: 'hoardingId',
          as: 'bookings'
        }
      },
      {
        $project: {
          name: 1,
          averageRating: 1,
          reviewCount: 1,
          bookingCount: { $size: '$bookings' },
          totalRevenue: {
            $sum: {
              $map: {
                input: '$bookings',
                as: 'booking',
                in: {
                  $cond: [
                    { $eq: ['$$booking.status', 'completed'] },
                    '$$booking.totalPrice',
                    0
                  ]
                }
              }
            }
          }
        }
      }
    ]);

    res.json({
      bookingStats,
      monthlyRevenue,
      hoardingPerformance,
      totalHoardings: hoardings.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
};

// Get admin analytics
exports.getAdminAnalytics = async (req, res) => {
  try {
    // Get user statistics
    const userStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get platform-wide booking statistics
    const bookingStats = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' }
        }
      }
    ]);

    // Get monthly platform revenue
    const monthlyRevenue = await Booking.aggregate([
      {
        $match: { status: 'completed' }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalPrice' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Get hoarding statistics
    const hoardingStats = await Hoarding.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get review statistics
    const reviewStats = await Review.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    res.json({
      userStats,
      bookingStats,
      monthlyRevenue,
      hoardingStats,
      reviewStats: reviewStats[0] || { averageRating: 0, totalReviews: 0 }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
}; 