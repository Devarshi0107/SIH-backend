// models/PhilatelicItem.js
const mongoose = require('mongoose');

const philatelicItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  postal_circle: { type: mongoose.Schema.Types.ObjectId, ref: 'PostalCircle', required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  images: [String],
  specifications: {
    year: Number,
    condition: String,
    dimensions: String,
    rarity: String
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'out_of_stock'],
    default: 'active'
  },
  deleted: { type: Boolean, default: false } ,
  created_at: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('PhilatelicItem', philatelicItemSchema);
