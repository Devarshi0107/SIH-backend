const express = require('express');
const router = express.Router();
const {
  getTotalPostalCircles,
  getTotalUsers,
  getTotalPDAAccounts,
  getTotalIncomeForCurrentMonth,
  approveNews, approveEvent
} = require("../controllers/admin.dashboard.controller");
const isAdmin = require('../middlewares/isAdmin');
const authenticateisuser = require('../middlewares/authenticateuser');

// Route definition
//Admin controller routes

//Admin dashboard controller routes
router.get('/total-postal-circles',isAdmin,getTotalPostalCircles);
router.get('/total-users',isAdmin,getTotalUsers);
router.get('/total-pda-accounts',isAdmin, getTotalPDAAccounts);
router.get("/total-income-current-month",isAdmin, getTotalIncomeForCurrentMonth);

router.put('/approve-news/:id', isAdmin, approveNews);
router.put('/approve-event/:id',isAdmin, approveEvent);

module.exports = router;
