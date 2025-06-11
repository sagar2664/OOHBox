const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded.userId });
    
    if (!user) {
      throw new Error();
    }

    req.token = token;
    req.user = user;
    //console.log(user , token);
    //return res.status(200).json({ message: "Authenticated" });
    next();
  } catch (error) {
    //console.log(error);
    return res.status(401).json({
      message: 'Authentication failed. Please log in again.',
      error: error.message
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      // console.log("Not authorized to perform this action");
      // console.log(req.user.role);
      // console.log(roles);
      return res.status(403).json({ 
        message: 'You do not have permission to perform this action' 
      });
    }
    next();
  };
};

module.exports = {
  auth,
  authorize
}; 