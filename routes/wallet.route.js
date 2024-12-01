// routes/wallet.route.js
const express = require('express');
const router = express.Router();
const walletController = require('../controllers/wallet.controller');
const authMiddleware = require('../middlewares/authenticateuser');


router.post('/create-payment-intent', walletController.createPaymentIntent);
router.get('/success', authMiddleware, walletController.verifyPayment)
router.get('/total-balance', authMiddleware, walletController.getWalletBalance);  

module.exports = router;
