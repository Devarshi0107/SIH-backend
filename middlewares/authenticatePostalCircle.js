const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const PostalCircle = require('../models/PostalCircle.model'); // Import the PostalCircle model

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = async (req, res, next) => {
  // const token = req.cookies.token;
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MzM5YmJiYTdhNjk0MGFkYjkwNmU1NyIsInJvbGUiOiJwb3N0YWxDaXJjbGUiLCJpYXQiOjE3MzM0NzkwNzUsImV4cCI6MTczMzU2NTQ3NX0.f2DZGoHwT9RII5fExLyGxap98dtZg5YUQfM2NWFWSvg"

  if (!token) {
    return res.status(401).json({ message: 'Authentication token is required' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    req.postalCircleId = decoded.id; // Extract postal circle ID from the token

    // Check if the user is a valid PostalCircle
    const postalCircle = await PostalCircle.findById(req.postalCircleId);

    if (!postalCircle || !postalCircle.active) {
      return res.status(403).json({ message: 'Access restricted to PostalCircle users only' });
    }

    next(); // Proceed to the next middleware/route handler
  } catch (error) {
    console.error('Error in authenticatePostalCircle middleware:', error);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

