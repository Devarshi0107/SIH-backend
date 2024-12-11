const PostalCircle = require("../models/PostalCircle.model")
const User = require("../models/User.model");
const PDA = require("../models/PDA.model");
const News = require('../models/News.model');
const Subscriber = require('../models/Subscriber.model');
const Event = require('../models/Event.model');
const nodemailer = require('nodemailer');
const PhilatelicItem = require('../models/PhilatelicItem.model');
const Order = require('../models/Order.model');

// Configure transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
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

exports.getItem = async (req, res) => {
  try {
    // Fetch all philatelic items from the database
    const philatelicItems = await PhilatelicItem.find({});

    // Format the created_at field for each item
    const itemsWithFormattedDate = philatelicItems.map(item => ({
      ...item.toObject(), // Convert Mongoose document to plain JS object
      created_at: moment(item.created_at).tz('Asia/Kolkata').format('DD/MM/YYYY')
    }));

    res.status(200).json(itemsWithFormattedDate);
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

// exports.createPhilatelicItem = async (req, res) => {
//   try {
//     const { name, description, category, subitem, price, stock, specifications, status } = req.body;

//     // Check if a file was uploaded
//     let imageUrl = null;
//     if (req.file) {
//       imageUrl = `${req.protocol}://${req.get('host')}/uploads/philatelicItemImg/${encodeURIComponent(req.file.filename)}`;
//     }

//     // Create new philatelic item
//     const philatelicItem = new PhilatelicItem({
//       name,
//       description,
//       category,
//       subitem,
//       price,
//       stock,
//       specifications,
//       image: imageUrl, // Store the uploaded image URL
//     });

//     // Save to database
//     await philatelicItem.save();

//     res.status(201).json({
//       message: 'Philatelic item created successfully',
//       philatelicItem,
//     });
//   } catch (error) {
//     console.error('Error creating philatelic item:', error);
//     res.status(500).json({ error: error.message });
//   }
// };

exports.createPhilatelicItem = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      category, 
      subitem, 
      price, 
      stock, 
      specifications, 
      status,
      year,
      visibility,
      notify
    } = req.body;

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
      year,
      specifications,
      image: imageUrl,
      visibility,
      notify
    });

    // Save to database
    await philatelicItem.save();
    console.log(notify);
    // Send notifications based on the 'notify' field
    if (notify === 'both' || notify === 'pda_users') {
      await sendPDANotifications(philatelicItem);
    }

    if (notify === 'both' || notify === 'normal_users') {
      await sendNormalUserNotifications(philatelicItem);
    }

    // Initialize arrays to track notified users
    let pdaNotifiedUsers = [];
    let normalNotifiedUsers = [];

    // Send notifications based on the 'notify' field
    if (notify === 'both' || notify === 'pda_users') {
      pdaNotifiedUsers = await sendPDANotifications(philatelicItem);
    }

    if (notify === 'both' || notify === 'normal_users') {
      normalNotifiedUsers = await sendNormalUserNotifications(philatelicItem);
    }

    res.status(201).json({
      message: 'Philatelic item created successfully',
      philatelicItem,
      notifications: {
        pdaUsers: pdaNotifiedUsers.map(user => user.name),
        normalUsers: normalNotifiedUsers.map(user => user.name)
      }
    });
  } catch (error) {
    console.error('Error creating philatelic item:', error);
    res.status(500).json({ error: error.message });
  }
};

// Send notifications to PDA users with matching preferences
async function sendPDANotifications(item) {
  try {
    // Find PDA users whose preferences match the new item
    console.log('inside sendPDanotifications',item.category);
    const pdaUsers = await PDA.find({
      'preferences.item_types': { $in: [item.category] },
      'preferences.notification_preferences.email': true
    })

    console.log("pda match",pdaUsers);
    // Send personalized emails to matching PDA users
    for (const pda of pdaUsers) {
      const emailOptions = {
        from: process.env.EMAIL_USER,
        to: pda.user.email,
        subject: 'New Philatelic Item Matching Your Preferences',
        html: `
<div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
  <div style="background-color: #1a4d2e; text-align: center; padding: 20px;">
    <h2 style="color: #fff; margin: 0;">Philatelic Treasures</h2>
  </div>
  
  <div style="background-color: #1a4d2e; color: #fff; padding: 20px; text-align: center;">
    <h3 style="margin: 0;">New Collection Item Alert!</h3>
    <p style="margin: 10px 0 0 0;">Matching Your Interests</p>
  </div>
  
  <div style="padding: 20px;">
    <p style="font-size: 16px; color: #333;">Dear ${pda.user.name},</p>
    
    <p style="font-size: 16px; color: #333;">
      We're excited to inform you about a new philatelic item that perfectly matches your collection preferences!
    </p>
    
    <div style="background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h3 style="color: #1a4d2e; margin-top: 0;">${item.name}</h3>
      
      <div style="text-align: center; margin: 15px 0;">
        <img src="${item.image}" alt="${item.name}" 
             style="max-width: 200px; max-height: 200px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      </div>
      
      <table style="width: 100%; margin-top: 15px; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #1a4d2e; width: 100px;">Category:</td>
          <td style="padding: 8px 0; color: #333;">${item.category}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #1a4d2e;">Subitem:</td>
          <td style="padding: 8px 0; color: #333;">${item.subitem}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #1a4d2e;">Price:</td>
          <td style="padding: 8px 0; color: #333;">$${item.price}</td>
        </tr>
      </table>
    </div>
    
    <p style="font-size: 16px; color: #333;">
      This item matches your interest in ${item.subitem}. Don't miss out on this opportunity to enhance your collection!
    </p>
    
    <div style="text-align: center; margin: 25px 0;">
      <a href="${process.env.FRONTEND_URL}/items/${item._id}" 
         style="background-color: #1a4d2e; color: white; padding: 12px 25px; text-decoration: none; 
                border-radius: 5px; display: inline-block; font-weight: bold;">
        View Item Details
      </a>
    </div>
    
    <p style="margin-top: 20px; font-size: 14px; color: #666;">
      Best Regards,<br>
      Your Philatelic Team
    </p>
  </div>
  
  <div style="background-color: #f1f1f1; color: #666; padding: 15px; text-align: center; font-size: 12px;">
    © ${new Date().getFullYear()} Philatelic Treasures. All rights reserved.
  </div>
  
  <div style="background-color: #fff; color: #666; padding: 15px; text-align: center; font-size: 12px; border-top: 1px solid #ddd;">
    <p style="margin: 0;">
      This email was sent because you opted to receive notifications for items matching your preferences.
      To update your preferences, please visit your account settings.
    </p>
  </div>
</div>
`
      };
      console.log("Email is sending..")
      await transporter.sendMail(emailOptions);
    }
  } catch (error) {
    console.error('Error sending PDA notifications:', error);
  }
}

// Send notifications to all normal users
async function sendNormalUserNotifications(item) {

  // console.log('inside sendNormalUserNotifications', item);
  try {
    // Find all normal users
    const users = await User.find({ 
      isPDA: false 
    });

    // console.log('found all users', users);
    // Send emails to normal users
    for (const user of users) {
      const emailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'New Philatelic Item Added',
        html: `
<div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
  <div style="background-color: #686800; text-align: center; padding: 20px;">
    <img src="https://presentations.gov.in/wp-content/uploads/2020/06/India-Post_Preview.png?x81500" alt="India Post Logo" style="width: 100px; height: auto;">
  </div>
  <div style="background-color: #686800; color: #fff; padding: 20px; text-align: center;">
    <h2>New Philatelic Item Available!</h2>
  </div>
  <div style="padding: 20px;">
    <p style="font-size: 16px; color: #333;">Hello ${user.name},</p>
    <p style="font-size: 16px; color: #333;">
      A new exciting philatelic item has been added to our collection:
    </p>
    <div style="border: 1px solid #ddd; padding: 15px; margin: 15px 0; border-radius: 5px;">
      <h3 style="color: #686800;">${item.name}</h3>
      <img src="${item.image}" alt="${item.name}" style="max-width: 100%; height: auto; margin: 10px 0;">
      <p style="font-size: 14px; color: #333;"><strong>Category:</strong> ${item.category}</p>
      <p style="font-size: 14px; color: #333;"><strong>Price:</strong> ${item.price}</p>
    </div>
    <div style="text-align: center; margin-top: 20px;">
      <a href="${process.env.FRONTEND_URL}/items/${item._id}" style="background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">View Item</a>
    </div>
  </div>
  <div style="background-color: #f1f1f1; color: #666; padding: 10px; text-align: center; font-size: 12px;">
    © 2024 India Post. All rights reserved.
  </div>
</div>

        `
      };
      console.log('Email is sending');
      await transporter.sendMail(emailOptions);
    }
  } catch (error) {
    console.error('Error sending normal user notifications:', error);
  }
}

exports.getAllOrders = async (req, res) => {
  try {
    // Find all orders, populate item details, and sort by created date
    const allOrders = await Order.find()
      .populate('user', 'name email') // Populate user details (name, email)
      .populate('items.philatelicItem', 'name price image') // Populate philatelic item details (name, price, image)
      .sort({ createdAt: -1 }); // Sort orders by creation date, newest first

    if (!allOrders.length) {
      return res.status(404).json({
        success: false,
        message: 'No orders found.',
      });
    }

    // Return all orders along with status and other details
    return res.status(200).json({
      success: true,
      orders: allOrders.map(order => ({
        orderId: order._id,
        user: order.user,
        items: order.items,
        totalAmount: order.totalAmount,
        orderStatus: order.status, // Order status field
        createdAt: order.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching all orders',
      errorDetails: error.message,
    });
  }
};
