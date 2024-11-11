const express = require('express');
require('dotenv').config();
const router = express.Router();
const { register, login, logout } = require('../controllers/auth.controller');

// Route for user registration
router.post('/register', register);

// Route for user login
router.post('/login', login);

// Route for user logout
router.post('/logout', logout);


module.exports = router;
