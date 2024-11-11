// middlewares/authenticate.js
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const dotenv = require('dotenv');
require('dotenv').config(); 

module.exports = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = user; // Set user for next middleware
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
