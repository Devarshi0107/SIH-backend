// controllers/newsController.js
const News = require('../models/News.model.js');

// Get all news items
exports.getNews = async (req, res) => {
  try {
    const news = await News.find().populate({
      path: 'postal_circle', // Field to populate in Event schema
      select: 'name' // Only retrieve the 'name' field from PostalCircle
    });
    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new news item
exports.createNews = async (req, res) => {
  const postal_circle = req.postalCircleId
  try {
    const news = new News({...req.body, postal_circle});
    await news.save();
    res.status(201).json(news);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//solved problem : {
  //   "error": "Cast to ObjectId failed for value \"67322ddb10c9c169dbcf6f77\\n\" (type string) at path \"_id\" for model \"News\""
  // }
// Get a news item by ID
// exports.getNewsById = async (req, res) => {
//   try {
//     const news = await News.findById(req.params.id);
//     if (!news) return res.status(404).json({ message: 'News not found' });
//     res.status(200).json(news);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };



// Get a news item by ID
exports.getNewsById = async (req, res) => {
  try {
    // Trim whitespace or newlines from the ID
    const id = req.params.id.trim();

    // Check if the provided ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const news = await News.findById(id);
    if (!news) return res.status(404).json({ message: 'News not found' });
    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// // Update a news item by ID
// exports.updateNews = async (req, res) => {
//   try {
//     const news = await News.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     if (!news) return res.status(404).json({ message: 'News not found' });
//     res.status(200).json(news);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };


const mongoose = require('mongoose');

// Update a news item by ID
exports.updateNews = async (req, res) => {
  try {
    // Trim whitespace or newlines from the ID
    const id = req.params.id.trim();

    // Check if the provided ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const news = await News.findByIdAndUpdate(id, req.body, { new: true });
    if (!news) return res.status(404).json({ message: 'News not found' });
    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Delete a news item by ID
// exports.deleteNews = async (req, res) => {
//   try {
//     const news = await News.findByIdAndDelete(req.params.id);
//     if (!news) return res.status(404).json({ message: 'News not found' });
//     res.status(200).json({ message: 'News deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };


// Delete a news item by ID
exports.deleteNews = async (req, res) => {
  try {
    // Trim whitespace or newlines from the ID
    const id = req.params.id.trim();

    // Check if the provided ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const news = await News.findByIdAndDelete(id);
    if (!news) return res.status(404).json({ message: 'News not found' });
    res.status(200).json({ message: 'News deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};