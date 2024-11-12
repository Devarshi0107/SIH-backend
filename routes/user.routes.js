const express = require('express');
const { addToCart } = require('../controllers/user.controller');
const router = express.Router();
const authMiddleware = require('../middlewares/authenticateuser');


router.post('/cart/add', authMiddleware, addToCart);

module.exports = router;
