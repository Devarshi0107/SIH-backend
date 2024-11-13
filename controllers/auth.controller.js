const bcrypt = require('bcrypt');
const axios = require('axios');
const User = require('../models/User.model');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
require('dotenv').config(); 
const JWT_SECRET = process.env.JWT_SECRET;

// Register a new user
exports.register = async (req, res) => {
    try {
        const { email, password, name, phone  } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            email,
            password: hashedPassword,
            name,
            phone,
            role: "user"
        });

        await newUser.save();
        res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

// Login an existing user
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(401).json({ message: 'Invalid password' });
       
        // Generate JWT token
        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

        // Set the token as an HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true,
            // secure: process.env.NODE_ENV === 'production', // Set to true in production
            sameSite: 'strict', // Helps prevent CSRF attacks
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });

        res.status(200).json({ message: 'Login successful',Role:user.role});
    } catch (error) {
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

// Logout
exports.logout = (req, res) => {
    // console.log(req);

    // Clear the authentication token cookie
    res.clearCookie('token'); // Replace 'token' with the actual name of your auth cookie, if different

   
    // Respond with a success message
    return res.status(200).json({ message: 'Logout successful'});
};
