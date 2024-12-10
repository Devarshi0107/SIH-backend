const crypto = require('crypto'); // Add this line to import the crypto module
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const mongoose = require('mongoose')
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;
const PostalCircle = require('../models/PostalCircle.model');
const PhilatelicItem = require('../models/PhilatelicItem.model');
const PDA = require('../models/PDA.model');
const Order = require('../models/Order.model');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

exports.getTotalOrder = async (req, res) => {
  try {
    const postalCircleId = req.postCircle._id;

    // Find the count of orders for the current postal circle
    const orderCount = await Order.countDocuments({ postalCircle: postalCircleId });

    res.status(200).json({
      message: `Order count for PostalCircle ${postalCircleId}`,
      orderCount
    });
  } catch (error) {
    console.error('Error in getOrderCountsByPostalCircle:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getTotalPhilatelicItems = async(req,res) =>{
  try {
    const postalCircleId = req.postCircle._id;
  
    // Fetch the count of items matching the postal_circle
    const itemCount = await PhilatelicItem.countDocuments({postal_circle: postalCircleId});

    res.status(200).json({
      message: 'Philatelic items count retrieved successfully',
      count: itemCount,
    });
  } catch (error) {
    console.error('Error in countPhilatelicItems controller:', error);
    res.status(500).json({ message: 'Server error while counting items', error });
  }
}

exports.getTotalPDAholder = async(req,res) =>{ 
  try {
    // Get the Postal Circle ID from the authenticated request
    const postalCircleId = req.postCircle._id;

    // Count PDAs for this specific Postal Circle
    const pdaCount = await PDA.countDocuments({ 
      postal_circle: postalCircleId 
    });

    // Optional: Count PDAs by different statuses it use in future
    const pdaStatusCount = await PDA.aggregate([
      { 
        $match: { 
          postal_circle: new mongoose.Types.ObjectId(postalCircleId) 
        } 
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      totalPDACount: pdaCount,
      pdaStatusBreakdown: pdaStatusCount,
      postalCircleId: postalCircleId
    });
  } catch (error) {
    console.error('Error fetching PDA count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve PDA count',
      error: error.message
    });
  }
}

exports.getTotalAncillaryItems = async (req,res)=>{
 try{
  const postalCircleId = req.postCircle._id;

  if (!postalCircleId) {
    return res.status(400).json({ message: 'Postal ID is required' });
  }

  // Count the number of PhilatelicItems with category 'PostalStationery' and the given postal_circle
  const totalPostalStationery = await PhilatelicItem.countDocuments({
    postal_circle: postalCircleId,
    category: 'PostalStationery',
  });

  // Respond with the count
  res.status(200).json({totalPostalStationery });
} catch (error) {
  console.error(error);
  res.status(500).json({ message: 'Error fetching total ancillary items', error: error.message });
}

}

exports.getPDAholderDetails = async (req,res) =>{
  try {
    // Get the Postal Circle ID from the authenticated request
    const postalCircleId = req.postCircle._id;

    // Find all users with philatelicInventory > 0
    const pdaUsers = await PDA.find({
      postal_circle: postalCircleId,
      $or: [
        { 'philatelicInventory.MintCommemorativeStamps': { $gt: 0 } },
        { 'philatelicInventory.MintDefinitiveStamps': { $gt: 0 } },
        { 'philatelicInventory.TopMarginalBlock': { $gt: 0 } },
        { 'philatelicInventory.BottomMarginalBlock': { $gt: 0 } },
        { 'philatelicInventory.FullSheet': { $gt: 0 } },
        { 'philatelicInventory.FirstDayCoversAffixed': { $gt: 0 } },
        { 'philatelicInventory.FirstDayCoversBlank': { $gt: 0 } },
        { 'philatelicInventory.InformationBrochureAffixed': { $gt: 0 } },
        { 'philatelicInventory.InformationBrochureBlank': { $gt: 0 } },
        { 'philatelicInventory.AnnualStampPack': { $gt: 0 } },
        { 'philatelicInventory.ChildrenSpecialAnnualStampPack': { $gt: 0 } },
        { 'philatelicInventory.SpecialCollectorsStampPack': { $gt: 0 } },
        { 'philatelicInventory.FirstDayCoverPack': { $gt: 0 } },
        { 'philatelicInventory.MiniSheetSouvenirSheet': { $gt: 0 } },
        { 'philatelicInventory.PostalStationery': { $gt: 0 } }
      ]
    })
      .populate('user', 'id email name address') // Populate user details
      .lean(); // Convert documents to plain JavaScript objects

    // Map the result to return filtered fields
    const result = pdaUsers.map(user => {
      // Filter philatelicInventory to include only fields with values > 0
      const filteredInventory = Object.entries(user.philatelicInventory || {})
        .filter(([key, value]) => value > 0) // Keep only items with values > 0
        .reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {});

      return {
        id: user.user._id,
        email: user.user.email,
        name: user.user.name,
        address: user.user.address,
        philatelicInventory: filteredInventory
      };
    });

    res.status(200).json({
      success: true,
      users: result,
      postalCircleId
    });
  } catch (error) {
    console.error('Error fetching PDA users with inventory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve PDA users with inventory',
      error: error.message
    });
  }
}
exports.getPostalCircles = async (req, res) => {
  try {
    // Use select to specify the fields you want to include
    const postalCircles = await PostalCircle.find({ active: true }).select('name unique_id');
    res.status(200).json(postalCircles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addBankDetails = async(req,res)=>{
  try {
    // Extract the postal ID from the middleware (assumed to be verified)
    const postalId = req.postCircle._id;
    console.log("in ",postalId);
    // Extract bank details from the request body
    const { account_number, ifsc_code, bank_name, branch_name } = req.body;
    console.log(req.body); 
    // Validate the provided bank details
    if (!account_number || !ifsc_code || !bank_name || !branch_name) {
      return res.status(400).json({
        success: false,
        message: "All bank details (account_number, ifsc_code, bank_name, branch_name) are required.",
      });
    }

    // Find and update the PostalCircle entry with the new bank details
    const updatedPostalCircle = await PostalCircle.findOneAndUpdate(
      { _id: postalId }, // Find by postal ID
      {
        $set: {
          bank_details: {
            account_number,
            ifsc_code,
            bank_name,
            branch_name,
          },
        },
      },
      { new: true } // Return the updated document
    );

    // If no document is found for the postal ID, return an error
    if (!updatedPostalCircle) {
      return res.status(404).json({
        success: false,
        message: "No PostalCircle found for the provided postal_id.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Bank details added/updated successfully.",
      data: updatedPostalCircle.bank_details,
    });
  } catch (error) {
    console.error("Error updating bank details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update bank details.",
      error: error.message,
    });
  }
}
 
// Helper function to generate a unique ID (prefix 'CP' followed by 6 random hex characters)
function generateUniqueId() {
  const uuid = 'PC' + crypto.randomBytes(3).toString("hex").toUpperCase(); // 3 bytes -> 6 hex characters
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
  // console.log("Creating",req.userId)
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
      user: req.userId,
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
      html:`<div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #686800; text-align: center; padding: 20px;">
        <img src="https://presentations.gov.in/wp-content/uploads/2020/06/India-Post_Preview.png?x81500" alt="India Post Logo" style="width: 100px; height: auto;">
      </div>
      <div style="background-color: #686800; color: #fff; padding: 20px; text-align: center;">
        <h2>Welcome, ${name}!</h2>
        <h3>Your Postal Circle Account is Now Ready</h3>
      </div>
      <div style="padding: 20px;">
        <p style="font-size: 16px; color: #333;">Dear ${name},</p>
        <p style="font-size: 16px; color: #333;">
          Congratulations on successfully registering your Postal Circle with India Post. We are excited to have you onboard! Below are your account credentials:
        </p>
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
        <p style="font-size: 16px; margin-top: 20px; color: #333;">
          To ensure the security of your account, we strongly recommend logging in and changing your password immediately.
        </p>
        <p style="font-size: 16px; color: #333;">
          You can now manage your Postal Circle's operations efficiently through our platform. If you have any questions or need help, our support team is here to assist you.
        </p>
        <p style="margin-top: 20px; font-size: 14px; color: #666;">
          Best Regards,<br>India Post - Postal Circle Team
        </p>
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
      return res.status(404).json({ message: "Postal Circle not found" });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      postalCircle.password
    );
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: postalCircle._id, role: "postalCircle" },
      JWT_SECRET,
      { expiresIn: "1d" }
    );
    const message = postalCircle.isDefaultPassword
      ? "Login successful. Please change your password as this is the default password."
      : `Login successful ${postalCircle.name}`;

    // Set the token as an HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === 'production', // Set to true in production
      sameSite: "strict", // Helps prevent CSRF attacks
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.status(200).json({ message, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// controllers/postalCircle.controller.js
exports.changePostalCirclePassword = async (req, res) => {
  // console.log("I am postCircle")
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

//logout
exports.logout = (req, res) => {
    
  console.log(res)
  // Clear the authentication token cookie, if it exists
  res.clearCookie('token'); // Replace 'token' with the actual name of your auth cookie, if different
  
  // Respond with a success message
  return res.status(200).json({ message: 'Logout Post Circle successful' });
};