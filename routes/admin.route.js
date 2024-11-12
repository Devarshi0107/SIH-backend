const express = require('express');
const router = express.Router();
const { createPostalCircle } = require('../controllers/admin.controller'); // Ensure correct path to admin.controller.js

// Route definition
router.post('/create-postalcircle', createPostalCircle); // Ensure 'createPostalCircle' is not undefined here

module.exports = router;
