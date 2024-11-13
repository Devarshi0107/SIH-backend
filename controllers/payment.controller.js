// controllers/payment.controller.js
const Order = require('../models/Order.model');
const User = require('../models/User.model');
const PostalCircle = require('../models/PostalCircle.model');
const PhilatelicItem = require('../models/PhilatelicItem.model'); 
const WalletTransaction = require('../models/WalletTransaction.model');
const stripe = require('../config/stripe.config');
const { createShiprocketOrder } = require('../services/shiprocket.service');
const JWT_SECRET = process.env.JWT_SECRET;
const jwt = require('jsonwebtoken');



// controllers/payment.controller.js
exports.processPaymentAndOrder = async (req, res) => {
  const { itemId, quantity, paymentMethod, postalCircleId } = req.body;
  console.log(req.user);
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    const item = await PhilatelicItem.findById(itemId);
    const postalCircle = await PostalCircle.findById(postalCircleId);
    const totalAmount = item.price * quantity;

    if (!user || !item || !postalCircle) {
      return res.status(404).json({ message: 'User, item, or postal circle not found' });
    }

    if (paymentMethod === 'wallet') {
      // Check if user has enough balance in the wallet
      if (user.wallet_balance < totalAmount) {
        return res.status(400).json({ message: 'Insufficient wallet balance' });
      }

      // Deduct the amount from user's wallet and add to postal circle's revenue
      user.wallet_balance -= totalAmount;
      postalCircle.total_revenue += totalAmount;

      // Reduce stock quantity of the item
      item.stock -= quantity;
      if (item.stock < 0) {
        item.stock = 0; // Ensure stock does not go negative
      }

      await user.save();
      await postalCircle.save();
      await item.save();

      // Create a transaction record for the wallet deduction
      await WalletTransaction.create({
        user: userId,
        postalCircle: postalCircleId,
        amount: totalAmount,
        transactionType: 'debit'
      });

      // Create the order with payment confirmation
      const order = await Order.create({
        user: userId,
        postalCircle: postalCircleId,
        items: [{ philatelicItem: itemId, quantity, price: item.price }],
        totalAmount,
        paymentMethod: 'wallet',
        paymentStatus: 'paid',
        orderStatus: 'processing'
      });

      res.status(200).json({ message: 'Order placed using wallet balance', order });

    } else if (paymentMethod === 'stripe') {
      // If using Stripe, create a Stripe payment session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'inr',
            product_data: { name: item.name },
            unit_amount: item.price * 100,
          },
          quantity: quantity,
        }],
        mode: 'payment',
        success_url: 'http://localhost:5173/order-success?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: 'http://localhost:5173/order-cancelled',
        customer_email: user.email,
        metadata: {
          userId: userId.toString(),
          itemId: itemId.toString(),
          quantity: quantity.toString(),
          postalCircleId: postalCircleId.toString()
        },
      });

      res.json({ url: session.url });
    } else {
      res.status(400).json({ message: 'Invalid payment method' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error processing payment or placing order', error });
  }
};

exports.verifyPayment = async (req, res) => {
  const { session_id } = req.query;

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["line_items.data.price.product"],
    });

    const userId = session.metadata.userId;
    const itemId = session.metadata.itemId;
    const quantity = parseInt(session.metadata.quantity, 10);
    const postalCircleId = session.metadata.postalCircleId;
    const totalAmount = session.amount_total / 100;

    if (session.payment_status === 'paid') {
      const user = await User.findById(userId);
      const item = await PhilatelicItem.findById(itemId);
      const postalCircle = await PostalCircle.findById(postalCircleId);

      if (!user || !item || !postalCircle) {
        return res.status(404).json({ message: 'User, item, or postal circle not found' });
      }

      postalCircle.total_revenue += totalAmount;
      await postalCircle.save();

      item.stock -= quantity;
      if (item.stock < 0) {
        item.stock = 0;
      }
      await item.save();

      const order = await Order.create({
        user: userId,
        postalCircle: postalCircleId,
        items: [{ philatelicItem: itemId, quantity, price: item.price }],
        totalAmount,
        paymentMethod: 'stripe',
        paymentStatus: 'paid',
        orderStatus: 'processing'
      });

      // Create Shiprocket order and save Shiprocket order ID
      const shiprocketOrderId = await createShiprocketOrder(order, user, item);
      order.shiprocketOrderId = shiprocketOrderId;
      await order.save();

      res.status(200).json({
        message: 'Payment verified, order placed, and Shiprocket order created successfully',
        order
      });
    } else {
      res.status(400).json({ message: 'Payment not completed' });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ error: "Failed to verify payment and update order details" });
  }
};

// controllers/payment.controller.js
const { getShiprocketOrderStatus } = require('../services/shiprocket.service');
exports.checkOrderStatus = async (req, res) => {
  const shiprocketOrderId = req.params.shiprocketOrderId; // Get the Shiprocket Order ID from params


  try {
    // Fetch the order by Shiprocket order ID from the database
    const order = await Order.findOne({ shiprocketOrderId });  // Query by shiprocketOrderId field

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Fetch the current status from Shiprocket
    const shiprocketStatus = await getShiprocketOrderStatus(order.shiprocketOrderId);  // Pass shiprocketOrderId to get the status

    // Map Shiprocket status to internal statuses if necessary
    let internalStatus;
    switch (shiprocketStatus) {
      case 'SELF FULFILLED':
        internalStatus = 'delivered';
        break;
      case 'CANCELED':
        internalStatus = 'cancelled';
        break;
      default:
        internalStatus = 'processing';
    }

    // Update the order status in the database
    order.orderStatus = internalStatus;
    await order.save();

    res.status(200).json({
      message: 'Order status updated successfully',
      order,
    });
  } catch (error) {
    console.error("Error checking order status:", error);
    res.status(500).json({ error: "Failed to check order status" });
  }
};
