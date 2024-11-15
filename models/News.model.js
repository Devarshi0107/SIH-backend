
const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String },
  postal_circle: { type: mongoose.Schema.Types.ObjectId, ref: 'PostalCircle', required: true },
  isApproved: { type: Boolean, default: false },
  postedTime: { type: Date, default: Date.now },
  youtubeUrl: { type: String }  // Add this field for YouTube URL
}, { timestamps: true });

module.exports = mongoose.model('News', newsSchema);
