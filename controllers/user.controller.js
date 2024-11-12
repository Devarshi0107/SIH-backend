const User = require('../models/user.model');
const PhilatelicItem = require('../models/PhilatelicItem.model');

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
