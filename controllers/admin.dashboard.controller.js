const PostalCircle = require("../models/PostalCircle.model")
const User = require("../models/User.model");
const PDA = require("../models/PDA.model");

//get total postal circles
exports.getTotalPostalCircles = async (req, res) =>{
    try {
          const totalPostalCircles = await PostalCircle.countDocuments();
          res.status(200).json({ totalPostalCircles });
    } catch (error) {
          res.status(500).json({ message: "Error retrieving total postal circles", error });
    }
}

// Get total users
exports.getTotalUsers = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        res.status(200).json({ totalUsers });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving total users', error });
    }
};

// Get total PDA accounts
exports.getTotalPDAAccounts = async (req, res) => {
    try {
        const totalPDAAccounts = await PDA.countDocuments();
        res.status(200).json({ totalPDAAccounts });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving total PDA accounts', error });
    }
};

// Get total income from all postal circles

exports.getTotalIncomeForCurrentMonth = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Fetch all postal circles
    const postalCircles = await PostalCircle.find();

    // Calculate total revenue for the current month based on revenue growth
    let totalIncomeForCurrentMonth = 0;

    for (const circle of postalCircles) {
      // Retrieve the cumulative revenue at the start of the month
      const startOfMonthRevenue = await PostalCircle.findOne(
        { _id: circle._id },
        { total_revenue: 1, created_at: 1 }
      )
        .where("created_at")
        .lt(startOfMonth);

      const monthlyRevenue =
        circle.total_revenue -
        (startOfMonthRevenue ? startOfMonthRevenue.total_revenue : 0);
      totalIncomeForCurrentMonth += monthlyRevenue;
    }

    res.status(200).json({ totalIncomeForCurrentMonth });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving total income for the current month",
      error,
    });
  }
};


