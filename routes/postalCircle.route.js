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


router.get('/', authenticateisuser,isAdmin, getPostalCircles);
router.post('/', authenticateisuser,isAdmin, createPostalCircle); // pela authenticateisuser hatu
router.post('/login', loginPostalCircle);  
router.post('/logout', logout);  // remove query
router.post('/change-password', authenticatePostalCircle, changePostalCirclePassword); 


module.exports = router;
