// controllers/postalCircleController.js
const PostalCircle = require('../models/PostalCircle');

exports.getPostalCircles = async (req, res) => {
  try {
    const postalCircles = await PostalCircle.find();
    res.status(200).json(postalCircles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createPostalCircle = async (req, res) => {
  try {
    const postalCircle = new PostalCircle(req.body);
    await postalCircle.save();
    res.status(201).json(postalCircle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
