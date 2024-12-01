// controllers/philatelicItemController.js
const PhilatelicItem = require('../models/PhilatelicItem.model');

exports.getPhilatelicItems = async (req, res) => {
  try {
    // Filter items where featured is true
    const philatelicItems = await PhilatelicItem.find({ featured: true }).populate('postal_circle'); 
    res.status(200).json(philatelicItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createPhilatelicItem = async (req, res) => {
  const postal_circle = req.postalCircleId
  console.log("PostCircle ID : ",postal_circle);
  try {
    const philatelicItem = new PhilatelicItem({...req.body, postal_circle}); // take postalCircle Id from middleware 
    await philatelicItem.save();
    res.status(201).json(philatelicItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
