const PDA = require('../models/PDA.model');
const User = require('../models/User.model');

// Get all PDA accounts for a specific user
exports.getUserPDAccounts = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find all PDA accounts for the specified user
    const userPDAAccounts = await PDA.find({ user: userId }, 'account_number postal_circle status balance')
      .populate('postal_circle', 'name');  // Populate postal circle's name if required

    if (!userPDAAccounts || userPDAAccounts.length === 0) {
      return res.status(404).json({ message: 'No accounts found for this user' });
    }

    res.status(200).json(userPDAAccounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getPDAbyuserID = async (req, res) => {
  try {
    const userId = req.user._id; // Get userId from the authenticated user (from the middleware)
    console.log("Fetching PDA details for user:", userId);

    // Fetch all PDA records for the user
    const pdaDetails = await PDA.find({ user: userId })
      .populate('postal_circle', 'name')  // Populate postal circle name
      .populate('user', 'name email');   // Optionally populate user information

    // Count the number of PDA records
    const pdaCount = pdaDetails.length;

    // If no PDA records are found for the given userId
    if (pdaCount === 0) {
      return res.status(404).json({ message: 'No PDA records found for this user.' });
    }

    // Return the fetched information along with the count
    res.status(200).json({
      count: pdaCount,
      pdaDetails,
    });
  } catch (error) {
    console.error("Error fetching PDA details:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get all PDA accounts for Admin
exports.getPDAs = async (req, res) => {
  try {
    const pdaAccounts = await PDA.find().populate("postal_circle");
    res.status(200).json(pdaAccounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Helper function to generate the next sequential account number
const generateAccountNumber = async () => {
  const lastPDA = await PDA.findOne().sort({ account_number: -1 });
  const lastAccountNumber = lastPDA ? parseInt(lastPDA.account_number, 10) : 0;
  return String(lastAccountNumber + 1).padStart(10, '0'); // Format as a 10-digit number
};

// Create a new PDA account
exports.createPDA = async (req, res) => {
  try {
    const { user, preferences, philatelicInventory } = req.body;

    // Check if an account already exists for this user in the same postal circle
    console.log("User Details:", user);
    
    const existingPDA = await PDA.findOne({ user });
    
    console.log("User exists or not", existingPDA);
    
    if (existingPDA) {
      return res.status(400).json({ message: 'An account already exists for this user in the specified postal circle' });
    }

    // Create a new PDA object with all required fields
    const pda = new PDA({
      user,
      preferences, // Include preferences from request body
      philatelicInventory, // Include inventory from request body
      account_number: await generateAccountNumber(), // Generate and assign account number
      status: 'active', // Default status
      balance: 0, // Default balance
      created_at: new Date(),
      lastUpdated: new Date(),
    });
    
    console.log("Account number:", pda.account_number);
    
    await pda.save();
    
    res.status(201).json(pda);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single PDA account by ID for admin
exports.getPDAById = async (req, res) => {
  try {
    const pda = await PDA.findById(req.params.id).populate('postal_circle');
    if (!pda) return res.status(404).json({ message: 'PDA not found' });
    res.status(200).json(pda);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a PDA account by ID
exports.updatePDA = async (req, res) => {
  try {
    const pda = await PDA.findByIdAndUpdate(req.params.id, { philatelicInventory: req.body.philatelicInventory }, { new: true });
    if (!pda) return res.status(404).json({ message: 'PDA not found' });
    res.status(200).json(pda);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a PDA account by ID
exports.deletePDA = async (req, res) => {
  try {
    const pda = await PDA.findByIdAndDelete(req.params.id);
    if (!pda) return res.status(404).json({ message: 'PDA not found' });
    res.status(200).json({ message: 'PDA deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.userPdaDetails = async (req, res) => {
  try {
      // Find the user based on the JWT token's user data
      const user = await User.findById(req.user.id);
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Fetch all PDA accounts associated with the user
      const pdaAccounts = await PDA.find({ user: user._id })
          .populate('postal_circle', 'name region state address')
          .populate('user', 'name email');

      if (pdaAccounts.length === 0) {
          return res.status(404).json({ message: 'No PDA accounts found for this user' });
      }

      // Prepare response data
      const pdaDetails = pdaAccounts.map(pda => ({
          account_number: pda.account_number,
          postal_circle: {
              name: pda.postal_circle.name,
              region: pda.postal_circle.region,
              state: pda.postal_circle.state,
              address: pda.postal_circle.address
          },
          balance: pda.balance,
          status: pda.status,
          philatelic_inventory: pda.philatelicInventory,
          lastUpdated: pda.lastUpdated
      }));

      return res.status(200).json({ pda_accounts: pdaDetails });
  } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server Error' });
  }
}

