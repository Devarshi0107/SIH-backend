const bcrypt = require('bcrypt');
const axios = require('axios');
const User = require('../models/User.model');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
require('dotenv').config(); 
const JWT_SECRET = process.env.JWT_SECRET;

const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      role: user.role 
    }, 
    process.env.JWT_SECRET, 
    { 
      expiresIn: '1h' 
    }
  );
};
// Register a new user
exports.register = async (req, res) => {
    try {
        const { email, password, name, phone } = req.body;

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

        // Save the new user to the database
        await newUser.save();

        // Generate JWT token after saving the user to access `newUser._id`
        const token = jwt.sign({ id: newUser._id, role: newUser.role }, JWT_SECRET, { expiresIn: '1d' });

        // Set the token as an HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true,
            // secure: process.env.NODE_ENV === 'production', // Set to true in production
            sameSite: 'strict', // Helps prevent CSRF attacks
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });

        res.status(201).json({ message: 'User created successfully', user: newUser, token });
    } catch (error) {
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};



exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = generateToken(user);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600000 // 1 hour
    });

    res.status(200).json({ 
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      },
      token 
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
  
// Logout
exports.logout = (req, res) => {
    // console.log(req);
    console.log("inside logout function of backend");
    
    // Clear the authentication token cookie
    res.clearCookie('token'); // Replace 'token' with the actual name of your auth cookie, if different
    
   
    // Respond with a success message
    return res.status(200).json({ message: 'Logout successful'});
};



exports.getCurrentUser = async (req, res) => {
  try {
    // req.user is set by the authenticateUser middleware
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Get Current User Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};