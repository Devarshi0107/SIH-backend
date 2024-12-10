const express = require('express');
const pdaOrderController = require('../controllers/pdaOrder.controller');
const authenticatePostalCircle = require('../middlewares/authenticatePostalCircle');
const router = express.Router();

// Route to fetch PDA users for the logged-in postal circle
router.get('/postal-circle/:postalCircleId/filter-users', authenticatePostalCircle, pdaOrderController.filterPDAUsers);

// Route to process PDA orders for filtered users
router.post('/process-orders', authenticatePostalCircle, pdaOrderController.processPdaOrders);

module.exports = router;
