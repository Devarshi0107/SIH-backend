// controllers/pdaController.js
const PDA = require('../models/PDA.model');

// Get all PDA accounts
exports.getPDAs = async (req, res) => {
  try {
    const pdaAccounts = await PDA.find().populate('postal_circle');
    res.status(200).json(pdaAccounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new PDA account
exports.createPDA = async (req, res) => {
  try {
    const pda = new PDA(req.body);
    await pda.save();
    res.status(201).json(pda);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single PDA account by ID
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
