const express = require('express');
const { addToCart ,getWishlist ,addProductToWishlist ,removeProductFromWishlist} = require('../controllers/user.controller');
const router = express.Router();
const authMiddleware = require('../middlewares/authenticateuser');


router.post('/cart/add', authMiddleware, addToCart);
router.get('/wishlist', authMiddleware, getWishlist);
router.post('/wishlist/add', authMiddleware, addProductToWishlist);
router.delete('/wishlist/remove/:productId', authMiddleware, removeProductFromWishlist);


module.exports = router;
