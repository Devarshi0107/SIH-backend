const PhilatelicItem = require('../models/PhilatelicItem.model');
exports.getPhilatelicItems = async (req, res) => {
  try {
    // Filter items where featured is true
    const philatelicItems = await PhilatelicItem.find().populate('postal_circle');
    // console.log('Phil', philatelicItems); 
    res.status(200).json(philatelicItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPhilatelicItemsById = async (req,res) => { 
}

// exports.createPhilatelicItem = async (req, res) => {
//   const postal_circle = req.postalCircleId
//   // console.log("PostCircle ID : ",postal_circle);
//   try {
//     const philatelicItem = new PhilatelicItem({...req.body, postal_circle}); // take postalCircle Id from middleware 
//     await philatelicItem.save();
//     res.status(201).json(philatelicItem);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

exports.createPhilatelicItem = async (req, res) => {

  const postal_circle = req.postalCircleId; // Assuming this is set by a middleware
  try {
    // Access the uploaded file
   
    // Create a new philatelic item with file information
    const philatelicItem = new PhilatelicItem({
      ...req.body,
      postal_circle,
      image:req.body.imageLink , // Save the file path to the database
    });
   
    // console.log("in ",philatelicItem);
    await philatelicItem.save();
    res.status(201).json(philatelicItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
