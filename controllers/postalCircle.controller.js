// controllers/postalCircle.controller.js

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


exports.createPostalCircle = async (req, res) => {
  try {
    // Assign default password from environment
    const defaultPassword = process.env.DEFAULT_PASSWORD;

    // Hash the password before storing (if applicable)
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Create new PostalCircle with hashed default password
    const postalCircle = new PostalCircle({
      ...req.body,
      password: hashedPassword  // Save hashed password
    });

    // Save the postal circle in the database
    await postalCircle.save();

    // Send notification email with default password and unique ID
    await sendNotificationEmail(postalCircle.email, defaultPassword, postalCircle.unique_id);

    res.status(201).json(postalCircle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Function to send notification email
const sendNotificationEmail = async (email, password, postalCircleID) => {
  // Setup nodemailer transporter with email provider details
  const transporter = nodemailer.createTransport({
    service: 'gmail',  // Or your email service provider
    auth: {
      user: process.env.EMAIL_USER,     // Your email address
      pass: process.env.EMAIL_PASSWORD  // Your email password or app password
    }
  });

  // Email details
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Welcome to the Postal Circle Management System',
    text: `You have been registered in the Postal Circle Management System.
      You can login using:
      Postal Circle ID: ${postalCircleID}
      Password: ${password}

      Please change your password after logging in.
    `
  };

  // Send the email
  await transporter.sendMail(mailOptions);
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
