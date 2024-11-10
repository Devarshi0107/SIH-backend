// routes/philatelicItemRoutes.js
const express = require('express');
const { getPhilatelicItems, createPhilatelicItem } = require('../controllers/philatelicItemController');
const router = express.Router();

router.get('/', getPhilatelicItems);
router.post('/', createPhilatelicItem);

module.exports = router;
