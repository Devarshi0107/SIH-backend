// middlewares/authenticatePostalCircle.js

const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
require('dotenv').config(); 
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Authentication token is required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.postalCircleId = decoded.id;  // Add postal circle ID to request object
    console.log("token decoded->", decoded);
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
