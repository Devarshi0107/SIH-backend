const express = require('express');
const multer = require('multer'); // Multer import
const {
  addToCart,
  getWishlist,
  addProductToWishlist,
  removeProductFromWishlist,
  updateUserProfile,
  getUserDetails 
} = require('../controllers/user.controller');
const router = express.Router();
const authMiddleware = require('../middlewares/authenticateuser');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profileImages'); // Directory for profile images
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user._id}-${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Limit to 5 MB
});


// Existing routes
router.post('/cart/add', authMiddleware, addToCart);
router.get('/wishlist', authMiddleware, getWishlist);
router.post('/wishlist/add', authMiddleware, addProductToWishlist);
router.delete('/wishlist/remove/:productId', authMiddleware, removeProductFromWishlist);

// New route for updating user profile with upload
router.put('/profile/update', authMiddleware, upload.single('profileImage'), updateUserProfile);
router.get('/:userId',authMiddleware, getUserDetails);

module.exports = router;
