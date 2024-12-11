const PostalCircle = require("../models/PostalCircle.model")
const User = require("../models/User.model");
const PDA = require("../models/PDA.model");
const News = require('../models/News.model');
const Subscriber = require('../models/Subscriber.model');
const Event = require('../models/Event.model');
const nodemailer = require('nodemailer');
const PhilatelicItem = require('../models/PhilatelicItem.model');

// Configure transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use your email service
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASSWORD  // Your password or app-specific password
  }
});

// Send email utility
const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error.message);
  }
};


exports.getAllPostCircleDetail = async (req, res) => {
  try {
    const postalCircles = await PostalCircle.find(); // Fetch all documents from the collection
    res.status(200).json({ postalCircles });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving postal circles", error });
  }
};

//get total postal circles
exports.getTotalPostalCircles = async (req, res) =>{
    try {
          const totalPostalCircles = await PostalCircle.countDocuments();
          const postalCircles = await PostalCircle.find();
          res.status(200).json({ totalPostalCircles, postalCircles });
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
// Approve News with Notifications
exports.approveNews = async (req, res) => {
  try {
    const news = await News.findByIdAndUpdate(
      req.params.id,
      { isApproved: true, status: 'accept' },
      { new: true }
    );

    if (!news) return res.status(404).json({ message: 'News not found' });

    // Fetch creator and mediator emails
    const creator =  await PostalCircle.findById(news.postal_circle);
    const mediators = await User.find({ role: 'mediator' });

    // Send emails
    if (creator) await sendEmail(creator.email, 'News Approved', `Your news "${news.title}" has been approved.`);
    for (const mediator of mediators) {
      await sendEmail(mediator.email, 'News Approved', `The news "${news.title}" has been approved.`);
    }

    // Notify subscribers
    const subscribers = await Subscriber.find({});
    for (const subscriber of subscribers) {
      await sendEmail(subscriber.email, 'New News Published', `A new news article "${news.title}" has been published.`);
    }

    res.status(200).json({ message: 'News approved successfully', news });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Approve Event with Notifications
exports.approveEvents = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { isApproved: true, status: 'accept' },
      { new: true }
    );

    if (!event) return res.status(404).json({ message: 'Event not found' });

       const creator =  await PostalCircle.findById(event.postal_circle);
    const mediators = await User.find({ role: 'mediator' });

    // Send emails
    if (creator) await sendEmail(creator.email, 'Event Approved', `Your event "${event.title}" has been approved.`);
    for (const mediator of mediators) {
      await sendEmail(mediator.email, 'Event Approved', `The event "${event.title}" has been approved.`);
    }

    // Notify subscribers
    const subscribers = await Subscriber.find({});
    for (const subscriber of subscribers) {
      await sendEmail(subscriber.email, 'New Event Published', `A new event "${event.title}" has been published.`);
    }

    res.status(200).json({ message: 'Event approved successfully', event });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Reject News with Notifications
exports.rejectNews = async (req, res) => {
  try {
    const news = await News.findByIdAndUpdate(
      req.params.id,
      { status: 'reject' },
      { new: true }
    );

    if (!news) return res.status(404).json({ message: 'News not found' });

    const creator =  await PostalCircle.findById(news.postal_circle);
    const mediators = await User.find({ role: 'mediator' });

    // Send emails
    if (creator) await sendEmail(creator.email, 'News Rejected', `Your news "${news.title}" has been rejected.`);
    for (const mediator of mediators) {
      await sendEmail(mediator.email, 'News Rejected', `The news "${news.title}" has been rejected.`);
    }

    res.status(200).json({ message: 'News rejected successfully', news });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Reject Event with Notifications
exports.rejectEvents = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { status: 'reject' },
      { new: true }
    );

    if (!event) return res.status(404).json({ message: 'Event not found' });
    const creator =  await PostalCircle.findById(event.postal_circle);
    const mediators = await User.find({ role: 'mediator' });

    // Send emails
    if (creator) await sendEmail(creator.email, 'Event Rejected', `Your event "${event.title}" has been rejected.`);
    for (const mediator of mediators) {
      await sendEmail(mediator.email, 'Event Rejected', `The event "${event.title}" has been rejected.`);
    }

    res.status(200).json({ message: 'Event rejected successfully', event });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createPhilatelicItem = async (req, res) => {
  try {
    const { name, description, category, subitem, price, stock, specifications, status } = req.body;

    // Check if a file was uploaded
    let imageUrl = null;
    if (req.file) {
      imageUrl = `${req.protocol}://${req.get('host')}/uploads/philatelicItemImg/${encodeURIComponent(req.file.filename)}`;
    }

    // Create new philatelic item
    const philatelicItem = new PhilatelicItem({
      name,
      description,
      category,
      subitem,
      price,
      stock,
      specifications,
      image: imageUrl, // Store the uploaded image URL
    });

    // Save to database
    await philatelicItem.save();

    res.status(201).json({
      message: 'Philatelic item created successfully',
      philatelicItem,
    });
  } catch (error) {
    console.error('Error creating philatelic item:', error);
    res.status(500).json({ error: error.message });
  }
};
