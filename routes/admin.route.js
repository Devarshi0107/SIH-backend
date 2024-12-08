const express = require('express');
const router = express.Router();
const {
  rejectNews,
  rejectEvents,
  approveNews,
  approveEvents,
  getAllPostCircleDetail,
  getTotalPostalCircles,
  getTotalUsers,
  getTotalPDAAccounts,
  getTotalIncomeForCurrentMonth,
  } = require("../controllers/admin.dashboard.controller");
const {createPostalCircle} = require("../controllers/postalCircle.controller")
const isAdmin = require('../middlewares/isAdmin');
const authenticateisuser = require('../middlewares/authenticateuser');

// Route definition
//Admin controller routes

//Admin dashboard controller routes
router.get('/allpostCircleDetail',isAdmin,getAllPostCircleDetail);
router.get('/total-postal-circles',isAdmin,getTotalPostalCircles);
router.get('/total-users',isAdmin,getTotalUsers);
router.get('/total-pda-accounts',isAdmin, getTotalPDAAccounts);
router.get("/total-income-current-month",isAdmin, getTotalIncomeForCurrentMonth);

router.put('/approve-news/:id', isAdmin, approveNews);
router.put('/approve-event/:id', isAdmin, approveEvents);
router.put('/reject-news/:id', isAdmin, rejectNews);
router.put('/reject-event/:id',isAdmin, rejectEvents);

router.post('/create-postal-circle', isAdmin, createPostalCircle) 
module.exports = router;
