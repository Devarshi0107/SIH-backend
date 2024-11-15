const mongoose = require('mongoose');
const News = require('../models/News.model.js');

// Create a news item (defaults to isApproved: false)
exports.createNews = async (req, res) => {
  const postal_circle = req.postalCircleId;
  try {
    const news = new News({ ...req.body, postal_circle, isApproved: false });
    await news.save();
    res.status(201).json(news);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Fetch only approved news items
exports.getNews = async (req, res) => {
  try {
    const news = await News.find({ isApproved: true }).populate('postal_circle', 'name');
    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a news item by ID, only if approved
exports.getNewsById = async (req, res) => {
  try {
    const id = req.params.id.trim();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const news = await News.findOne({ _id: id, isApproved: true });
    if (!news) return res.status(404).json({ message: 'News not found or not approved' });
    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a news item by ID
exports.updateNews = async (req, res) => {
  try {
    const id = req.params.id.trim();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    // Retrieve the existing news item
    const existingNews = await News.findById(id);
    if (!existingNews) return res.status(404).json({ message: 'News not found' });

    const updateData = { ...req.body };

    // Keep the original isApproved status if not explicitly updated in req.body
    if (req.body.isApproved === undefined) {
      updateData.isApproved = existingNews.isApproved;
    }

    const updatedNews = await News.findByIdAndUpdate(id, updateData, { new: true });
    res.status(200).json(updatedNews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a news item by ID
exports.deleteNews = async (req, res) => {
  try {
    const id = req.params.id.trim();

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
