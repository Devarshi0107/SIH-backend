const express = require('express');
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const PostalCircle = require("../models/PostalCircle.model");
require('dotenv').config(); // Ensure parentheses are here to load the .env file


// Helper function to generate a unique ID (5 characters)
function generateUniqueId() {
    const uuid = crypto.randomBytes(3).toString("hex").toUpperCase(); // 3 bytes -> 6 hex characters
    // console.log("Generated Unique ID:", uuid);
    return uuid;
  }

// Helper function to generate a password (8 characters)
function generatePassword() {
    const pass = crypto.randomBytes(6).toString("base64").slice(0, 8); // 6 bytes -> 8 base64 characters
    // console.log("Generated Password:", pass);
    return pass; 
  }


// Set up Nodemailer transport
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
});

// Function to create and save a new Postal Circle
exports.createPostalCircle = async (req, res) => {
  try {
    const { name, email, region, state, address } = req.body;

    if(!name || !email || !state || !address){
      return res.status(500).json({
        message: 'All fields are required, something went wrong !',
      })
    }

    // Check if a PostalCircle with the same email already exists
    const existingPostalCircle = await PostalCircle.findOne({ email });
    if (existingPostalCircle) {
      return res.status(400).json({ message: "A Postal Circle with this email already exists." });
    }

    // Generate unique ID and password
    const unique_id = generateUniqueId();
    const plainPassword = generatePassword();

    // Hash the password
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Create a new postal circle object
    const newPostalCircle = new PostalCircle({
      unique_id,
      name,
      email,
      password: hashedPassword,
      region,
      state,
      address,
      active: true,
    });

    console.log(newPostalCircle);

    // Save to database
    await newPostalCircle.save();

    // Send email with unique ID and password
    const mailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject: "Postal Circle Account Details",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #007bff; color: #fff; padding: 20px; text-align: center;">
            <h2>Welcome to Postal Circle!</h2>
          </div>
          <div style="padding: 20px;">
            <p style="font-size: 16px;">Dear Postal Circle User,</p>
            <p style="font-size: 16px;">Your account has been created successfully. Below are your login details:</p>
            <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px; font-weight: bold; color: #007bff;">Unique ID:</td>
                <td style="padding: 10px; color: #333;">${unique_id}</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold; color: #007bff;">Password:</td>
                <td style="padding: 10px; color: #333;">${plainPassword}</td>
              </tr>
            </table>
            <p style="font-size: 16px; margin-top: 20px;">Please log in and change your password at the earliest for security reasons.</p>
            <p style="font-size: 16px;">If you have any questions, feel free to contact our support team.</p>
            <p style="margin-top: 20px; font-size: 14px; color: #666;">Thank you,<br>Postal Circle Team</p>
          </div>
          <div style="background-color: #f1f1f1; color: #666; padding: 10px; text-align: center; font-size: 12px;">
            © 2024 Postal Circle. All rights reserved.
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Done");

    res.status(201).json({ message: "Postal Circle created and email sent successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating Postal Circle" });
  }
};
