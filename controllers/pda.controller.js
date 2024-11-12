const PDA = require('../models/PDA.model');

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

// Get all PDA accounts for Admin
exports.getPDAs = async (req, res) => {
  try {
    const pdaAccounts = await PDA.find().populate('postal_circle');
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
    const { user, postal_circle } = req.body;

    // Check if an account already exists for this user in the same postal circle
    const existingPDA = await PDA.findOne({ user, postal_circle });
    if (existingPDA) {
      return res.status(400).json({ message: 'An account already exists for this user in the specified postal circle' });
    }

    // Create a new PDA object without the account number
    const pda = new PDA(req.body);
    
    // Generate and assign the next unique account number
    pda.account_number = await generateAccountNumber();
    
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
    const pda = await PDA.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
