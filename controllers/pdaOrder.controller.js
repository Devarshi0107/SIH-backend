const PDAOrder = require('../models/PdaOrder.model');
const PDA = require('../models/PDA.model');
const User = require('../models/User.model');
const PhilatelicItem = require("../models/PhilatelicItem.model");
const PostalCircle = require("../models/PostalCircle.model");
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

// exports.processOrders = async (req, res) => {
//   const { philatelicItems, users } = req.body;

//   if (!philatelicItems || !users || !Array.isArray(users)) {
//     return res.status(400).json({ message: "Invalid request body." });
//   }

//   const successfulOrders = [];
//   const failedUsers = [];

//   try {
//     // Fetch all PhilatelicItems in one query to reduce DB calls
//     const itemsMap = new Map();
//     const items = await PhilatelicItem.find({ _id: { $in: philatelicItems } });
//     items.forEach(item => itemsMap.set(item._id.toString(), item));

//     for (const userObj of users) {
//       const { userId, philatelicInventory } = userObj;
//       const user = await User.findById(userId);

//       if (!user) {
//         failedUsers.push({ userId, reason: "User not found." });
//         continue;
//       }

//       let totalPrice = 0;
//       const itemUpdates = [];

//       // Calculate total price and prepare inventory updates
//       for (const [subcategory, quantity] of Object.entries(philatelicInventory)) {
//         const philatelicItem = items.find(item => item.subitem === subcategory);

//         if (!philatelicItem) {
//           failedUsers.push({ userId, reason: `Item not found for subcategory: ${subcategory}.` });
//           continue;
//         }

//         if (philatelicItem.stock < quantity) {
//           failedUsers.push({ userId, reason: `Insufficient stock for ${subcategory}.` });
//           continue;
//         }

//         totalPrice += philatelicItem.price * quantity;
//         itemUpdates.push({ item: philatelicItem, quantity });
//       }

//       // Check if the user has enough balance
//       if (user.wallet_balance < totalPrice) {
//         failedUsers.push({ userId, reason: "Insufficient wallet balance." });
//         continue;
//       }

//       // Deduct the amount from the user's wallet
//       user.wallet_balance -= totalPrice;

//       // Deduct stock from the PhilatelicItems
//       itemUpdates.forEach(({ item, quantity }) => {
//         item.stock -= quantity;
//       });

//       // Credit the amount to the Postal Circle's wallet
//       const postalCircle = await PostalCircle.findById(itemUpdates[0]?.item.postal_circle);
//       if (postalCircle) {
//         postalCircle.total_revenue += totalPrice;
//         await postalCircle.save();
//       }

//       // Save the updated user and PhilatelicItems
//       await user.save();
//       await Promise.all(itemUpdates.map(({ item }) => item.save()));

//       successfulOrders.push({ userId, totalPrice });
//     }

//     res.status(200).json({
//       message: "Order processing completed.",
//       successfulOrders,
//       failedUsers,
//     });
//   } catch (error) {
//     console.error("Error processing orders:", error);
//     res.status(500).json({ message: "Internal server error." });
//   }
// };
