// routes/postalCircle.route.js

const express = require('express');
const { 
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


// router.post('/',isAdmin, createPostalCircle); // pela authenticateisuser hatu
router.get('/',getPostalCircles); // for display in pda
router.post('/login', loginPostalCircle);  
router.post('/logout', logout);  // remove query
router.post('/change-password', authenticatePostalCircle, changePostalCirclePassword); 


module.exports = router;
