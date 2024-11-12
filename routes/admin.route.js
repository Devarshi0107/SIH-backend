const express = require('express');
const router = express.Router();
const { createPostalCircle } = require('../controllers/admin.controller'); // Ensure correct path to admin.controller.js
const {
  getTotalPostalCircles,
  getTotalUsers,
  getTotalPDAAccounts,
  getTotalIncomeForCurrentMonth,
} = require("../controllers/admin.dashboard.controller");

// Route definition
//Admin controller routes
router.post('/create-postalcircle', createPostalCircle); // Ensure 'createPostalCircle' is not undefined here


//Admin dashboard controller routes
router.get('/total-postal-circles',getTotalPostalCircles);
router.get('/total-users', getTotalUsers);
router.get('/total-pda-accounts', getTotalPDAAccounts);
router.get("/total-income-current-month", getTotalIncomeForCurrentMonth);

module.exports = router;
