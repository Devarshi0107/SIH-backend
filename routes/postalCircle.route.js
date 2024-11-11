// routes/postalCircle.route.js

const express = require('express');
const { 
    getPostalCircles, 
    createPostalCircle, 
    loginPostalCircle, 
    changePostalCirclePassword 
  } = require('../controllers/postalCircle.controller');
const isAdmin = require('../middlewares/isAdmin');
const router = express.Router();
const authenticateisuser = require('../middlewares/authenticateuser');
const authenticatePostalCircle = require('../middlewares/authenticatePostalCircle');


router.get('/', authenticateisuser, getPostalCircles);
router.post('/', authenticateisuser, isAdmin, createPostalCircle);
router.post('/login', loginPostalCircle);  
router.post('/change-password', authenticatePostalCircle, changePostalCirclePassword); 


module.exports = router;
