// routes/payment.route.js
const express = require('express');
const { processPaymentAndOrder, verifyPayment, checkOrderStatus } = require('../controllers/payment.controller');
const router = express.Router();
const authenticateisuser = require('../middlewares/authenticateuser');


router.post('/checkout',authenticateisuser, processPaymentAndOrder);
router.get('/verify',authenticateisuser, verifyPayment);
router.get('/check-order-status/:shiprocketOrderId', checkOrderStatus); // Endpoint to check order status in Shiprocket

module.exports = router;
