const express = require('express');
const {
  addToCart,
  getWishlist,
  addProductToWishlist,
  removeProductFromWishlist,
  updateUserProfile 
} = require('../controllers/user.controller');
const router = express.Router();
const authMiddleware = require('../middlewares/authenticateuser');

// Existing routes
router.post('/cart/add', authMiddleware, addToCart);
router.get('/wishlist', authMiddleware, getWishlist);
router.post('/wishlist/add', authMiddleware, addProductToWishlist);
router.delete('/wishlist/remove/:productId', authMiddleware, removeProductFromWishlist);

// New route for updating user profile
router.put('/profile/update', authMiddleware, updateUserProfile);

module.exports = router;
