// routes/postalCircle.route.js

const express = require('express');
const { 
    getTotalOrder,
    getTotalPhilatelicItems,
    getTotalPDAholder,
    getTotalAncillaryItems,
    getPDAholderDetails,
    getPostalCircles, 
    createPostalCircle, 
    loginPostalCircle, 
    changePostalCirclePassword ,
    logout
  } = require('../controllers/postalCircle.controller');
const isAdmin = require('../middlewares/isAdmin');
const router = express.Router();
const authenticateisuser = require('../middlewares/authenticateuser');
const authenticatePostalCircle = require('../middlewares/authenticatePostalCircle');


router.get('/',getPostalCircles); // for display in pda
//dashboard
router.get('/totalOrder',authenticatePostalCircle,getTotalOrder);
router.get('/totalItems',authenticatePostalCircle,getTotalPhilatelicItems);
router.get('/totalPDAholder',authenticatePostalCircle,getTotalPDAholder);
router.get('/totalAncillaryItems',authenticatePostalCircle,getTotalAncillaryItems);

router.get('/pdaholderDetails',authenticatePostalCircle,getPDAholderDetails);

router.post('/',isAdmin, createPostalCircle); // pela authenticateisuser hatu
router.post('/login', loginPostalCircle);  
router.post('/logout', logout);  // remove query
router.post('/change-password', authenticatePostalCircle, changePostalCirclePassword);

// // Count on Dashborad of Postal Circle 


module.exports = router;
