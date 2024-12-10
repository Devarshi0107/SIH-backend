// const PhilatelicItem = require('../models/PhilatelicItem.model');
// exports.getPhilatelicItems = async (req, res) => {
//   try {
//     // Filter items where featured is true
//     const philatelicItems = await PhilatelicItem.find().populate('postal_circle');
//     // console.log('Phil', philatelicItems); 
//     res.status(200).json(philatelicItems);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };


// exports.getPhilatelicItemsByPostCircle = async (req, res) => {
//   try {
//     const postalCircleId = req.postCircle._id; // Access the postalCircle attached in middleware

//     console.log('postalcircle id', postalCircleId);
//     // Fetch philatelic items associated with the postal circle
//     const philatelicItems = await PhilatelicItem.find({ postal_circle: postalCircleId });

//     if (!philatelicItems || philatelicItems.length === 0) {
//       return res.status(404).json({ message: 'No philatelic items found for this postal circle' });
//     }

//     res.status(200).json(philatelicItems); // Return the fetched items
//   } catch (error) {
//     console.error('Error fetching philatelic items:', error);
//     res.status(500).json({ message: 'Server error while fetching philatelic items' });
//   }
// };
// // exports.createPhilatelicItem = async (req, res) => {
// //   const postal_circle = req.postalCircleId
// //   // console.log("PostCircle ID : ",postal_circle);
// //   try {
// //     const philatelicItem = new PhilatelicItem({...req.body, postal_circle}); // take postalCircle Id from middleware 
// //     await philatelicItem.save();
// //     res.status(201).json(philatelicItem);
// //   } catch (error) {
// //     res.status(500).json({ error: error.message });
// //   }
// // };

// exports.createPhilatelicItem = async (req, res) => {

//   const postal_circle = req.postalCircleId; // Assuming this is set by a middleware
//   try {
//     // Access the uploaded file
   
//     // Create a new philatelic item with file information
//     const philatelicItem = new PhilatelicItem({
//       ...req.body,
//       postal_circle,
//       image:req.body.imageLink , // Save the file path to the database
//     });
   
//     // console.log("in ",philatelicItem);
//     await philatelicItem.save();
//     res.status(201).json(philatelicItem);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };


exports.updatePhilatelicItem = async (req, res) => {
  const { itemID } = req.params; // Extract the item ID from URL parameters
  const updateData = req.body; // The data to be updated
  console.log(itemID, updateData);
  try {
    // Fetch the existing item to validate `subitem` based on the `category`
    const existingItem = await PhilatelicItem.findById(itemID);
    // console.log("item",existingItem); 
    if (!existingItem) {
      return res.status(404).json({ message: 'Philatelic item not found' });
    }

    // Validate `subitem` based on the `category`
    const categoryToSubitemType = {
      Stamps: ['MintCommemorativeStamps', 'MintDefinitiveStamps', 'TopMarginalBlock', 'BottomMarginalBlock', 'FullSheet'],
      Covers: ['FirstDayCoversAffixed', 'FirstDayCoversBlank', 'FirstDayCoverPack'],
      Brochures: ['InformationBrochureAffixed', 'InformationBrochureBlank'],
      Packs: ['AnnualStampPack', 'ChildrenSpecialAnnualStampPack', 'SpecialCollectorsStampPack'],
      Souvenirs: ['MiniSheet/SouvenirSheet'],
      PostalStationery: 'number', // PostalStationery expects a number
      OtherItems: 'string' // OtherItems expects a string
    };

    if (updateData.subitem) {
      const category = updateData.category || existingItem.category; // Use new or existing category
      const subitemType = categoryToSubitemType[category];

      if (category === 'PostalStationery' && typeof updateData.subitem !== 'number') {
        return res.status(400).json({ message: 'Subitem must be a number for PostalStationery category' });
      }

      if (category === 'OtherItems' && typeof updateData.subitem !== 'string') {
        return res.status(400).json({ message: 'Subitem must be a string for OtherItems category' });
      }

      if (Array.isArray(subitemType) && !subitemType.includes(updateData.subitem)) {
        return res.status(400).json({
          message: `Invalid subitem for category ${category}. Allowed values are: ${subitemType.join(', ')}`
        });
      }
    }

    // Update the philatelic item
    const updatedItem = await PhilatelicItem.findByIdAndUpdate(
      itemID,
      updateData,
      { new: true, runValidators: true } // Return the updated item and validate
    );

    if (!updatedItem) {
      return res.status(404).json({ message: 'Philatelic item not found' });
    }

    res.status(200).json({
      message: 'Philatelic item updated successfully',
      data: updatedItem
    });
  } catch (error) {
    console.error('Error updating philatelic item:', error);
    res.status(500).json({
      message: 'An error occurred while updating the philatelic item',
      error: error.message
    });
  }
};
const PhilatelicItem = require("../models/PhilatelicItem.model");
exports.getPhilatelicItems = async (req, res) => {
  try {
    // Filter items where featured is true
    const philatelicItems = await PhilatelicItem.find().populate(
      "postal_circle"
    );
    // console.log('Phil', philatelicItems);
    res.status(200).json(philatelicItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPhilatelicItemsByPostCircle = async (req, res) => {
  try {
    const postalCircleId = req.postCircle._id; // Access the postalCircle attached in middleware

    console.log("postalcircle id", postalCircleId);
    // Fetch philatelic items associated with the postal circle
    const philatelicItems = await PhilatelicItem.find({
      postal_circle: postalCircleId,
    });

    if (!philatelicItems || philatelicItems.length === 0) {
      return res
        .status(404)
        .json({ message: "No philatelic items found for this postal circle" });
    }

    res.status(200).json(philatelicItems); // Return the fetched items
  } catch (error) {
    console.error("Error fetching philatelic items:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching philatelic items" });
  }
};
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

// const PhilatelicItem = require('../models/PhilatelicItem');

exports.createPhilatelicItem = async (req, res) => {
  const postal_circle = req.body.postalCircleId; // Ensure it's passed in the request body
  try {
    const philatelicItem = new PhilatelicItem({
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      subitem: req.body.subitem,
      postal_circle,
      price: req.body.price,
      stock: req.body.stock,
      image: req.body.imageLink,
      specifications: req.body.specifications,
      status: req.body.status || "active",
    });

    await philatelicItem.save();
    res.status(201).json(philatelicItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
