const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  PhilatelicItem: { type: mongoose.Schema.Types.ObjectId, ref: 'PhilatelicItem' },
  quantity: { type: Number, min: 1 },
  // deleted: { type: Boolean, default: false } // Soft delete flag
});

// User Schema
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      pincode: Number,
      country: String
    },
    role: {
      type: String,
      enum: ['user', 'admin','mediator'],
      default: 'user'
    },
    cart: [cartItemSchema],
    coins: { type: Number, default: 0 },
    wallet_balance: { type: Number, default: 0 },
    isSubscribed: { type: Boolean, default: false },
    profileImage: { type: String }, 
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  }, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
