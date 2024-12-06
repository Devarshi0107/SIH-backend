const User = require('../models/User.model');
const PhilatelicItem = require('../models/PhilatelicItem.model');
const Wishlist = require('../models/Wishlist.model');
const mongoose = require('mongoose');

exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id; // Assume user ID is retrieved from a token middleware
    const { itemId, quantity } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const philatelicItem = await PhilatelicItem.findById(itemId);
    if (!philatelicItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    const cartItem = user.cart.find(item => item.PhilatelicItem.toString() === itemId);
    
    if (cartItem) {
      cartItem.quantity += quantity;
    } else {
      user.cart.push({ PhilatelicItem: itemId, quantity });
    }

    await user.save();
    res.status(200).json({ message: "Item added to cart", cart: user.cart });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


// Add Product to Wishlist (Corrected)
exports.addProductToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await PhilatelicItem.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, PhilatelicItem: [productId] });
    } else {
      if (!wishlist.PhilatelicItem.includes(productId)) {
        wishlist.PhilatelicItem.push(productId);
      }
    }

    await wishlist.save();
    res.status(200).json({ message: 'Product added to wishlist', wishlist });
  } catch (error) {
    console.error('Error adding product to wishlist:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// Get Wishlist (Corrected)
exports.getWishlist = async (req, res) => {
  try {
   
    const wishlist = await Wishlist.find({ user: req.user._id })
    .populate({
      path: 'PhilatelicItem',
      match: { deleted: false }
    });
  

    if (!wishlist) {
      return res.status(404).json({ error: 'Wishlist not found' });
    }
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Remove Product from Wishlist (Corrected)
// Remove Product from Wishlist (Corrected)
exports.removeProductFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // Ensure that productId is valid
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    // Remove the product from the wishlist
    const result = await Wishlist.updateOne(
      { user: req.user._id },
      { $pull: { PhilatelicItem: productId } }
    );

    // Check if any documents were modified
    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: 'Product not found in wishlist' });
    }

    // Fetch and return the updated wishlist
    const updatedWishlist = await Wishlist.findOne({ user: req.user._id }).populate('PhilatelicItem');
    res.status(200).json({ message: 'Product removed from wishlist', wishlist: updatedWishlist });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Update user profile controller
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user._id; // User ID from auth middleware
    const updates = req.body; // Data to update

    // Allowed fields to update
    const allowedUpdates = ["name", "phone", "address"];
    const updateFields = {};

    // Only include allowed fields in the update
    for (let key of allowedUpdates) {
      if (updates[key] !== undefined) {
        updateFields[key] = updates[key];
      }
    }

    // Handle profile image if uploaded
    if (req.file) {
      updateFields.profileImage = req.file.path; // Store path of uploaded image
    }

    // Update user profile and return updated user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

exports.getUserDetails = async (req, res) => {
  const { userId } = req.params; // Extract userId from the request parameters

  try {
    const user = await User.findById(userId).select('-password'); // Fetch user details excluding the password

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving user details", error });
  }
};
