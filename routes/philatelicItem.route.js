// routes/philatelicItemRoutes.js
const express = require('express');
const { getPhilatelicItems, createPhilatelicItem } = require('../controllers/philatelicItem.controller');
const authenticatePostalCircle = require('../middlewares/authenticatePostalCircle');
const authMiddleware = require('../middlewares/authenticateuser');


const router = express.Router();

router.get('/',authMiddleware, getPhilatelicItems);
router.post('/',authenticatePostalCircle, createPhilatelicItem);

module.exports = router;
