const mongoose = require('mongoose');

const PDAOrderSchema = new mongoose.Schema({
  postalCircle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PostalCircle',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  selectedCategories: {
    type: Map, // Key: category, Value: array of selected subcategories
    of: [String],
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['processed', 'failed'],
    default: 'processed',
  },
  reason: {
    type: String,
    default: '', // If status is failed, store the reason here
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('PDAOrder', PDAOrderSchema);
