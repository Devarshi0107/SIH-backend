const crypto = require('crypto'); // Add this line to import the crypto module
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;
const PostalCircle = require('../models/PostalCircle.model');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

exports.getPostalCircles = async (req, res) => {
  try {
    const postalCircles = await PostalCircle.find();
    res.status(200).json(postalCircles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper function to generate a unique ID (prefix 'CP' followed by 6 random hex characters)
function generateUniqueId() {
  const uuid = 'CP' + crypto.randomBytes(3).toString("hex").toUpperCase(); // 3 bytes -> 6 hex characters
  // console.log("Generated Unique ID:", uuid);
  return uuid;
}

// Helper function to generate a password (8 characters)
function generatePassword() {
  return crypto.randomBytes(6).toString("base64").slice(0, 8);
}

// Set up Nodemailer transport
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Function to create and save a new Postal Circle
exports.createPostalCircle = async (req, res) => {
  try {
    const { name, email, region, state, address } = req.body;

    if (!name || !email || !state || !address) {
      return res.status(500).json({
        message: 'All fields are required, something went wrong!',
      });
    }

    const existingPostalCircle = await PostalCircle.findOne({ email });
    if (existingPostalCircle) {
      return res.status(400).json({ message: "A Postal Circle with this email already exists." });
    }

    const unique_id = generateUniqueId();
    const plainPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const newPostalCircle = new PostalCircle({
      unique_id,
      name,
      email,
      password: hashedPassword,
      user: req.user._id,
      region,
      state,
      address,
      active: true,
    });

    await newPostalCircle.save();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Postal Circle Account Details",
      html: `<div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
  <div style="background-color: #686800; text-align: center; padding: 20px;">
    <img src="https://presentations.gov.in/wp-content/uploads/2020/06/India-Post_Preview.png?x81500" alt="India Post Logo" style="width: 100px; height: auto;">
  </div>

  <div style="background-color: #686800; color: #fff; padding: 20px; text-align: center;">
    <h2>Welcome to India Post's Postal Circle!</h2>
  </div>

  <div style="padding: 20px;">
    <p style="font-size: 16px; color: #333;">Dear Postal Circle,</p>
    <p style="font-size: 16px; color: #333;">We are pleased to inform you that your account has been successfully created. Below are your login credentials:</p>
    <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
      <tr>
        <td style="padding: 10px; font-weight: bold; color: #686800;">Unique ID:</td>
        <td style="padding: 10px; color: #333;">${unique_id}</td>
      </tr>
      <tr>
        <td style="padding: 10px; font-weight: bold; color: #686800;">Password:</td>
        <td style="padding: 10px; color: #333;">${plainPassword}</td>
      </tr>
    </table>
    <p style="font-size: 16px; margin-top: 20px; color: #333;">To ensure the security of your account, we recommend logging in and changing your password as soon as possible.</p>
    <p style="font-size: 16px; color: #333;">If you have any questions or need assistance, please don't hesitate to reach out to our support team.</p>
    <p style="margin-top: 20px; font-size: 14px; color: #666;">Best Regards,<br>India Post - Postal Circle Team</p>
  </div>

  <div style="background-color: #f1f1f1; color: #666; padding: 10px; text-align: center; font-size: 12px;">
    © 2024 India Post. All rights reserved.
  </div>
  <div style="background-color: #fff; color: #666; padding: 10px; text-align: center; font-size: 12px; border-top: 1px solid #ddd;">
    <strong>Note:</strong> Please remember to change your password after logging in for the first time to maintain account security.
  </div>
</div>`,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: "Postal Circle created and email sent successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating Postal Circle" });
  }
};


exports.loginPostalCircle = async (req, res) => {
  const { unique_id, password } = req.body;
  try {
    const postalCircle = await PostalCircle.findOne({ unique_id });
    if (!postalCircle) {
      return res.status(404).json({ message: 'Postal Circle not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, postalCircle.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: postalCircle._id, role: 'postalCircle' }, JWT_SECRET, { expiresIn: '1d' });
    
    const message = postalCircle.isDefaultPassword 
      ? 'Login successful. Please change your password as this is the default password.' 
      : 'Login successful';

    res.status(200).json({ message, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// controllers/postalCircle.controller.js
exports.changePostalCirclePassword = async (req, res) => {
  const { unique_id, oldPassword, newPassword } = req.body;
  try {
    const postalCircle = await PostalCircle.findOne({ unique_id });
    
    if (!postalCircle) {
      return res.status(404).json({ message: 'Postal Circle not found' });
    }

    // Verify old password
    const isOldPasswordValid = await bcrypt.compare(oldPassword, postalCircle.password);
    if (!isOldPasswordValid) {
      return res.status(401).json({ message: 'Old password is incorrect' });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password and reset `isDefaultPassword` flag
    postalCircle.password = hashedNewPassword;
    postalCircle.isDefaultPassword = false;

    await postalCircle.save();
    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.logout = (req, res) => {
    
  console.log(res)
  // Clear the authentication token cookie, if it exists
  res.clearCookie('token'); // Replace 'token' with the actual name of your auth cookie, if different
  
  // Respond with a success message
  return res.status(200).json({ message: 'Logout Post Circle successful' });
};