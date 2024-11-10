// models/News.js
const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String },
  postalCircle: { type: String, required: true },
  postedTime: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('News', newsSchema);
