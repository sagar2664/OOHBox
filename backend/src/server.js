require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

// Database connection with retry logic
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hoarding_booking');
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    // Retry connection after 5 seconds
    setTimeout(connectDB, 5000);
  }
};

connectDB();

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/hoardings', require('./routes/hoarding.routes'));
app.use('/api/bookings', require('./routes/booking.routes'));
app.use('/api/reviews', require('./routes/review.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/test', require('./routes/test.routes'));

const PORT = process.env.PORT || 5000;

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
}); 