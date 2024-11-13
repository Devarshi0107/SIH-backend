// controllers/philatelicItemController.js
const PhilatelicItem = require('../models/PhilatelicItem.model');

exports.getPhilatelicItems = async (req, res) => {
  try {
    const philatelicItems = await PhilatelicItem.find().populate('postal_circle');
    res.status(200).json(philatelicItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createPhilatelicItem = async (req, res) => {
  const postal_circle = req.postalCircleId
  console.log("PostCircle ID : ",postal_circle);
  try {
    const philatelicItem = new PhilatelicItem({...req.body, postal_circle});
    await philatelicItem.save();
    res.status(201).json(philatelicItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
