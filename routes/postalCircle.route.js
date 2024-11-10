// routes/postalCircleRoutes.js
const express = require('express');
const { getPostalCircles, createPostalCircle } = require('../controllers/postalCircle.controller');
const router = express.Router();

router.get('/', getPostalCircles);
router.post('/', createPostalCircle);

module.exports = router;
