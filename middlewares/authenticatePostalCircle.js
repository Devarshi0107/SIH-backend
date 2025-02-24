const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const PostalCircle = require('../models/PostalCircle.model'); // Import the PostalCircle model

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = async (req, res, next) => {
  // const token = req.cookies.token;
  const authHeader = req.headers.authorization;

  // console.log(`Authentication`, authHeader);
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: 'Invalid or missing Authorization header' });
  }
  
  const token = authHeader.split(" ")[1];
 
  if (!token) {
    return res.status(401).json({ message: 'Authentication token is required' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if the user is a valid PostalCircle
    const postalCircle = await PostalCircle.findById(decoded.id);

    if (!postalCircle || !postalCircle.active) {
      return res.status(403).json({ message: 'Access restricted to PostalCircle users only' });
    }

    req.postCircle = postalCircle;
    next(); // Proceed to the next middleware/route handler
  } catch (error) {
    console.error('Error in authenticatePostalCircle middleware:', error);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

