// routes/payment.route.js
const express = require('express');
const { processPaymentAndOrder ,verifyPayment} = require('../controllers/payment.controller');
const authMiddleware = require('../middlewares/authenticateuser');

const router = express.Router();

router.post('/checkout',authMiddleware, processPaymentAndOrder);
router.get('/verify', authMiddleware, verifyPayment)

module.exports = router;
