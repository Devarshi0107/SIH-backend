const PDAOrder = require('../models/PdaOrder.model');
const PDA = require('../models/PDA.model');
const User = require('../models/User.model');
const PhilatelicItem = require("../models/PhilatelicItem");
const PostalCircle = require("../models/PostalCircle");
// const sendEmail = require('../utils/sendEmail'); // Utility function to send emails

// Fetch users based on postalCircle and selected categories
exports.filterPDAUsers = async (req, res) => {
  const { postalCircleId } = req.params;
  const { selectedCategories } = req.body;

  try {
    // Fetch PDA accounts and populate user details
    const pdaAccounts = await PDA.find({ postal_circle: postalCircleId }).populate('user', 'name email address');

    const filteredUsers = pdaAccounts
      .filter(account =>
        Object.entries(selectedCategories).some(([category, subcategories]) =>
          subcategories.some(subcategory => account.philatelicInventory[subcategory] > 0)
        )
      )
      .map(account => ({
        userId: account.user._id,
        name: account.user.name,
        email: account.user.email,
        address: account.user.address,
        philatelicInventory: account.philatelicInventory,
      }));

    res.status(200).json({ users: filteredUsers });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



