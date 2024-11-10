// routes/philatelicItemRoutes.js
const express = require('express');
const { getPhilatelicItems, createPhilatelicItem } = require('../controllers/philatelicItem.controller');
const router = express.Router();

router.get('/', getPhilatelicItems);
router.post('/', createPhilatelicItem);

module.exports = router;
