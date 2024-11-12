// routes/wallet.route.js
const express = require('express');
const router = express.Router();
const walletController = require('../controllers/wallet.controller');

router.post('/create-payment-intent', walletController.createPaymentIntent);
router.get('/success', walletController.verifyPayment)

module.exports = router;
