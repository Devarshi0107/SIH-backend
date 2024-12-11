const User = require("../models/User.model");
const PhilatelicItem = require("../models/PhilatelicItem.model");
const Wishlist = require("../models/Wishlist.model");
const Order = require("../models/Order.model");
const mongoose = require("mongoose");

// Update Delivery Address Controller
exports.updateDeliveryAddress = async (req, res) => {
  try {
    const user = req.user; // User data from middleware
    const { street, city, state, pincode, country } = req.body; // Destructure address details

    // Validate input fields
    if (!street || !city || !state || !pincode || !country) {
      return res.status(400).json({
        message: "All address fields (street, city, state, pincode, country) are required",
      });
    }

    // Update user's delivery address
    user.address = {
      street,
      city,
      state,
      pincode,
      country,
    };

    await user.save(); // Save updated user document

    res.status(200).json({
      message: "Delivery address updated successfully",
      address: user.address,
    });
  } catch (error) {
    console.error("Error updating delivery address:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
exports.getCartItems = async (req, res) => {
  try {
    // Retrieve the authenticated user from the middleware
    const userId = req.user._id;

    // Validate that userId is available
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    // Fetch the user's cart with populated PhilatelicItem details
    const user = await User.findById(userId).populate('cart.PhilatelicItem', 'name price image');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Return the user's cart items
    return res.status(200).json({
      success: true,
      cart: user.cart
    });
  } catch (error) {
    console.error("Error fetching cart items:", error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

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

    const cartItem = user.cart.find(
      (item) => item.PhilatelicItem.toString() === itemId
    );

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

exports.removeCartItem = async (req, res) => {
  try {
    const userId = req.user._id; // Retrieved from the middleware
    const { cartItemId } = req.params; // Cart item ID from URL

    console.log("Removing cart item:", cartItemId);

    // Update the user's cart by removing the specified cart item
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { cart: { _id: cartItemId } } }, // Remove the specific cart item
      { new: true } // Return the updated document
    );

    if (!user) {
      return res.status(404).json({ message: 'User or cart item not found' });
    }

    res.status(200).json({
      message: 'Cart item removed successfully',
      cart: user.cart // Return updated cart
    });
  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({ message: 'Server error while removing cart item' });
  }
};

exports.updateCartItemQuantity = async (req, res) => {
  try {
    const userId = req.user._id; // Retrieved from the middleware
    const { cartItemId } = req.params; // Cart item ID from URL
    const { delta } = req.body; // Increment/Decrement value from request body
    console.log('Update item',delta)
    if (!delta || typeof delta !== 'number') {
      return res.status(400).json({ message: 'Invalid or missing delta value' });
    }

    console.log(`Updating cart item ${cartItemId} with delta: ${delta}`);

    // Update the specific cart item's quantity
    const user = await User.findOneAndUpdate(
      {
        _id: userId,
        'cart._id': cartItemId,
      },
      {
        $inc: { 'cart.$.quantity': delta }, // Increment or decrement the quantity
      },
      { new: true } // Return the updated document
    );

    if (!user) {
      return res.status(404).json({ message: 'User or cart item not found' });
    }

    res.status(200).json({
      message: 'Cart item quantity updated successfully',
      cart: user.cart,
    });
  } catch (error) {
    console.error('Error updating cart item quantity:', error);
    res.status(500).json({ message: 'Server error while updating cart item quantity' });
  }
};

// Add Product to Wishlist (Corrected)
exports.addProductToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await PhilatelicItem.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = new Wishlist({
        user: req.user._id,
        PhilatelicItem: [productId],
      });
    } else {
      if (!wishlist.PhilatelicItem.includes(productId)) {
        wishlist.PhilatelicItem.push(productId);
      }
    }

    await wishlist.save();
    res.status(200).json({ message: "Product added to wishlist", wishlist });
  } catch (error) {
    console.error("Error adding product to wishlist:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Get Wishlist (Corrected)
exports.getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.find({ user: req.user._id }).populate({
      path: "PhilatelicItem",
      match: { deleted: false },
    });

    if (!wishlist) {
      return res.status(404).json({ error: "Wishlist not found" });
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
      return res.status(400).json({ error: "Invalid product ID" });
    }

    // Remove the product from the wishlist
    const result = await Wishlist.updateOne(
      { user: req.user._id },
      { $pull: { PhilatelicItem: productId } }
    );

    // Check if any documents were modified
    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "Product not found in wishlist" });
    }

    // Fetch and return the updated wishlist
    const updatedWishlist = await Wishlist.findOne({
      user: req.user._id,
    }).populate("PhilatelicItem");
    res.status(200).json({
      message: "Product removed from wishlist",
      wishlist: updatedWishlist,
    });
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
      // if (updates[key] !== undefined) {
      //   updateFields[key] = updates[key];
      // }
      updateFields["name"] = updates["displayName"];
      updateFields["phone"] = updates["mobile"];
      updateFields["address"] = updates["address"];
      if(updates["street"] != ""){
        updateFields["street"] = updates["street"];
      }
      if(updates["city"] != ""){
        updateFields["city"] = updates["city"];
      }
      if(updates["street"] != ""){
        updateFields["street"] = updates["street"];
      }
      if(updates["state"] != ""){
        updateFields["state"] = updates["state"];
      }
      if(updates["pincode"] != ""){
        updateFields["pincode"] = updates["pincode"];
      }
      if(updates["country"] != ""){
        updateFields["country"] = updates["country"];
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
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating profile", error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    // Fetch the user by ID from the database
    let user = await User.findById(req.params.id);

    // If user is not found, return a 404 response
    if (!user) {
      user = await PostalCircleModel.findById(req.params.id);
      if(!user){
        return res.status(404).json({ message: "User not found" });
      }
    }

    // Return the user data
    return res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user by ID:", error);

    // Return a 500 response for any server errors
    return res.status(500).json({ message: "Internal server error" });
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
exports.getOrderHistory = async (req, res) => {
  const userId = req.user._id; // Ensure the user is authenticated and user._id is available

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID',
      });
    }

    // Find all orders placed by the authenticated user
    const orderHistory = await Order.find({ user: userId })
      .populate('items.philatelicItem', 'name price image') // Populate the items with philatelic item details
      .sort({ createdAt: -1 }); // Sort by creation date, newest first

    if (!orderHistory.length) {
      return res.status(404).json({
        success: false,
        message: 'No order history found for the user.',
      });
    }

    // Return the order history along with status
    return res.status(200).json({
      success: true,
      orderHistory: orderHistory.map(order => ({
        orderId: order._id,
        items: order.items,
        totalAmount: order.totalAmount,
        orderStatus: order.status, // Order status field
        createdAt: order.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching order history:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error processing order history',
      errorDetails: error.message,
    });
  }
};
// Import your Order model

exports.getOrderHistory = async (req, res) => {
  const userId = req.user._id; // Ensure this is the authenticated user's ID

  try {
    // Check if userId is valid
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID',
      });
    }

    // Fetch all orders placed by the authenticated user
    const orderHistory = await Order.find({ user: userId })
      .populate('items.philatelicItem', 'name price image')  // Populate details of philatelicItem (name, price, image)
      .sort({ createdAt: -1 }); // Sort by creation date, newest first

    if (orderHistory.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No order history found for this user.',
      });
    }

    // Map over the orders to structure the response properly
    const orders = orderHistory.map(order => ({
      orderId: order._id,
      items: order.items.map(item => ({
        philatelicItem: item.philatelicItem,
        quantity: item.quantity,
        fulfilledQuantity: item.fulfilledQuantity,
        price: item.price,
        totalItemPrice: item.quantity * item.price,
      })),
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      fulfilledByAdmin: order.fulfilledByAdmin,
      createdAt: order.createdAt,
    }));

    // Return the order history
    return res.status(200).json({
      success: true,
      orderHistory: orders,
    });
  } catch (error) {
    console.error('Error fetching order history:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching order history',
      errorDetails: error.message,
    });
  }
};


// // Update Badges (Manual Trigger)
// exports.updateBadges = async (req, res) => {
//   try {
//     // Find the user based on their authenticated ID
//     const user = await User.findById(req.user._id);

//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     // Example logic for badge updates
//     const updatedBadges = [];
//     const milestone = 10;  // Example: User achieves a milestone after 10 actions

//     if (user.actionsCount >= milestone && !user.badges.includes('Milestone Badge')) {
//       updatedBadges.push('Milestone Badge');
//     }

//     // Add badges if criteria are met
//     if (updatedBadges.length > 0) {
//       user.badges = [...user.badges, ...updatedBadges]; // Update the user's badges
//     }

//     await user.save(); // Save user document with updated badges

//     res.json({
//       message: 'Badges updated successfully',
//       badges: user.badges,
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// Example: Add Stamp to Gallery
exports.addStampToGallery = async (req, res) => {
  try {
    // Find the user based on their authenticated ID
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Increment the user's stamp gallery count
    user.stampGalleryCount += 1;

    // Example logic: Update badge if user reaches a certain stamp count
    if (user.stampGalleryCount === 5 && !user.badges.includes('Stamp Collector Badge')) {
      user.badges.push('Stamp Collector Badge');
    }

    await user.save(); // Save user document with updated badge (if applicable)

    res.json({
      message: 'Stamp added successfully',
      badges: user.badges,  // Return updated badges
      stampGalleryCount: user.stampGalleryCount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
