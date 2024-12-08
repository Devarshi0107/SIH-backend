const express = require('express');
const { subscribeUser } = require('../controllers/subscriber.controller'); // Corrected import

const router = express.Router();

// Subscribe Route
router.post('/subscribe', subscribeUser); // Correct function name

module.exports = router;


// http://localhost:5000/api/subscribers/subscribe