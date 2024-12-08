// const nodemailer = require('nodemailer');
// const Subscriber = require('../models/Subscriber.model'); // Assuming this model exists

// // Set up Nodemailer transport
// const transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASSWORD,
//   },
// });

// // Function to subscribe a user
// exports.subscribeUser = async (req, res) => {
//   const { email } = req.body; // Assuming email is sent in the body

//   try {
//     // Check if the user is already subscribed
//     const existingSubscriber = await Subscriber.findOne({ email });
//     if (existingSubscriber) {
//       return res.status(400).json({ message: 'You are already subscribed.' });
//     }

//     // Create a new subscriber record
//     const newSubscriber = new Subscriber({
//       email,
//     });

//     await newSubscriber.save();

//     // Send confirmation email
//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: email,
//       subject: "Subscription Confirmation",
//       html: `
//         <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
//           <div style="background-color: #686800; text-align: center; padding: 20px;">
//             <img src="https://presentations.gov.in/wp-content/uploads/2020/06/India-Post_Preview.png?x81500" alt="India Post Logo" style="width: 100px; height: auto;">
//           </div>

//           <div style="background-color: #686800; color: #fff; padding: 20px; text-align: center;">
//             <h2>Thank You for Subscribing to Our Notifications!</h2>
//           </div>

//           <div style="padding: 20px;">
//             <p style="font-size: 16px; color: #333;">Dear Subscriber,</p>
//             <p style="font-size: 16px; color: #333;">Thank you for subscribing to receive event notifications and announcements. You will now receive updates directly to your email.</p>
//             <p style="font-size: 16px; color: #333;">If you have any questions, please feel free to contact us.</p>
//             <p style="margin-top: 20px; font-size: 14px; color: #666;">Best Regards,<br>India Post - Notification Team</p>
//           </div>

//           <div style="background-color: #f1f1f1; color: #666; padding: 10px; text-align: center; font-size: 12px;">
//             © 2024 India Post. All rights reserved.
//           </div>
//           <div style="background-color: #fff; color: #666; padding: 10px; text-align: center; font-size: 12px; border-top: 1px solid #ddd;">
//             <strong>Note:</strong> You will receive event notifications and announcements via email.
//           </div>
//         </div>
//       `,
//     };

//     await transporter.sendMail(mailOptions);

//     // Respond with success
//     res.status(201).json({ message: 'Subscription successful. A confirmation email has been sent.' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Error subscribing user' });
//   }
// };


//above working without css htmk

const nodemailer = require('nodemailer');
const Subscriber = require('../models/Subscriber.model'); // Assuming this model exists

// Set up Nodemailer transport
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Function to subscribe a user
exports.subscribeUser = async (req, res) => {
  const { email } = req.body; // Assuming email is sent in the body

  try {
    // Check if the user is already subscribed
    const existingSubscriber = await Subscriber.findOne({ email });
    if (existingSubscriber) {
      return res.status(400).json({ message: 'You are already subscribed.' });
    }

    // Create a new subscriber record
    const newSubscriber = new Subscriber({
      email,
    });

    await newSubscriber.save();

    // Send confirmation email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Subscription Confirmation",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #686800; text-align: center; padding: 20px;">
            <img src="https://presentations.gov.in/wp-content/uploads/2020/06/India-Post_Preview.png?x81500" alt="India Post Logo" style="width: 100px; height: auto;">
          </div>

          <div style="background-color: #686800; color: #fff; padding: 20px; text-align: center;">
            <h2>Welcome to India Post's Postal Circle!</h2>
          </div>

          <div style="padding: 20px;">
            <p style="font-size: 16px; color: #333;">Dear Subscriber,</p>
            <p style="font-size: 16px; color: #333;">We are pleased to inform you that your subscription has been successfully processed. You will now receive event notifications and announcements directly to your email.</p>
            <p style="font-size: 16px; color: #333;">If you have any questions, feel free to contact us.</p>
            <p style="margin-top: 20px; font-size: 14px; color: #666;">Best Regards,<br>India Post - Notification Team</p>
          </div>

          <div style="background-color: #f1f1f1; color: #666; padding: 10px; text-align: center; font-size: 12px;">
            © 2024 India Post. All rights reserved.
          </div>
          <div style="background-color: #fff; color: #666; padding: 10px; text-align: center; font-size: 12px; border-top: 1px solid #ddd;">
            <strong>Note:</strong> You will receive event notifications and announcements via email.
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    // Respond with success
    res.status(201).json({ message: 'Subscription successful. A confirmation email has been sent.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error subscribing user' });
  }
};
