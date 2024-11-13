// models/WalletTransaction.model.js
const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  postalCircle: { type: mongoose.Schema.Types.ObjectId, ref: 'PostalCircle', required: true },
  amount: { type: Number, required: true },
  transactionType: { type: String, enum: ['debit', 'credit'], required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('WalletTransaction', walletTransactionSchema);
