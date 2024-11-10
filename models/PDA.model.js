// models/PDA.js
const mongoose = require('mongoose');

const pdaSchema = new mongoose.Schema({
  account_number: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  postal_circle: { type: mongoose.Schema.Types.ObjectId, ref: 'PostalCircle', required: true },
  balance: { type: Number, default: 0 },
  preferences: {
    item_types: [String],
    notification_preferences: {
      email: Boolean,
      sms: Boolean
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  created_at: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('PDA', pdaSchema);
