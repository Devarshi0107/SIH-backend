const mongoose = require("mongoose");

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
      pincode: String,
      country: String
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    coins: { type: Number, default: 0 },
    wallet_balance: { type: Number, default: 0 },
    isSubscribed: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  }, { timestamps: true });
  
module.exports=new mongoose.model('Users',userSchema);;