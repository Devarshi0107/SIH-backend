// routes/philatelicItemRoutes.js
const express = require('express');
const { getPhilatelicItems, createPhilatelicItem } = require('../controllers/philatelicItem.controller');
const authenticatePostalCircle = require('../middlewares/authenticatePostalCircle');

const router = express.Router();

router.get('/', getPhilatelicItems);
router.post('/',authenticatePostalCircle, createPhilatelicItem);

module.exports = router;
