// routes/postalCircleRoutes.js
const express = require('express');
const { getPostalCircles, createPostalCircle } = require('../controllers/postalCircleController');
const router = express.Router();

router.get('/', getPostalCircles);
router.post('/', createPostalCircle);

module.exports = router;
