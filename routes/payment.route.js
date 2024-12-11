// routes/payment.route.js
const express = require('express');
const { processPaymentAndOrder, fulfillOrder } = require('../controllers/payment.controller');
const router = express.Router();
const authenticateisuser = require('../middlewares/authenticateuser');
const isAdmin = require('../middlewares/isAdmin');


router.post('/checkout',authenticateisuser, processPaymentAndOrder);
router.post('/fulfillOrder/:orderId', isAdmin, fulfillOrder); 

module.exports = router;
