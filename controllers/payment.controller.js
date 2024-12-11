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


exports.processPaymentAndOrder = async (req, res) => {
  const { paymentMethod } = req.body;
  const userId = req.user._id;

  try {
    const user = await User.findById(userId).populate('cart.PhilatelicItem');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.cart.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    let totalAmount = 0;
    const orderItems = [];
    const postalCircles = new Set();

    // Calculate total amount and prepare metadata
    for (const cartItem of user.cart) {
      const item = cartItem.PhilatelicItem;
      if (!item) {
        return res.status(404).json({ message: 'Item not found in cart' });
      }

      if (item.stock < cartItem.quantity) {
        return res.status(400).json({ message: `Insufficient stock for item ${item.name}` });
      }

      totalAmount += item.price * cartItem.quantity;
      orderItems.push({
        philatelicItem: item._id,
        quantity: cartItem.quantity,
        price: item.price,
        postalCircle: item.postal_circle.toString(),
      });

      postalCircles.add(item.postal_circle.toString());
    }

    if (paymentMethod === 'wallet') {
      if (user.wallet_balance < totalAmount) {
        return res.status(400).json({ message: 'Insufficient wallet balance' });
      }

      // Deduct wallet balance
      user.wallet_balance -= totalAmount;
      await user.save();

      res.status(200).json({ message: 'Wallet payment processed successfully', totalAmount });
    } else if (paymentMethod === 'stripe') {
      const lineItems = user.cart.map(cartItem => ({
        price_data: {
          currency: 'inr',
          product_data: { name: cartItem.PhilatelicItem.name },
          unit_amount: cartItem.PhilatelicItem.price * 100,
        },
        quantity: cartItem.quantity,
      }));

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `http://localhost:5173/order-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: 'http://localhost:5173/order-cancelled',
        customer_email: user.email,
        metadata: {
          userId: userId.toString(),
          postalCircles: JSON.stringify([...postalCircles]),
          orderItems: JSON.stringify(orderItems),
        },
      });

      res.status(200).json({ stripeSessionUrl: session.url });
    } else {
      res.status(400).json({ message: 'Invalid payment method' });
    }
  } catch (error) {
    console.error('Error processing payment and order:', error);
    res.status(500).json({ message: 'Error processing payment or placing order', error });
  }
};

exports.verifyPayment = async (req, res) => {
  const { session_id } = req.query;

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    const userId = session.metadata.userId;
    const postalCircles = JSON.parse(session.metadata.postalCircles);
    const orderItems = JSON.parse(session.metadata.orderItems);
    const totalAmount = session.amount_total / 100;

    if (session.payment_status === 'paid') {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Process orders by postal circle
      const orders = [];
      for (const postalCircleId of postalCircles) {
        const itemsForCircle = orderItems.filter(item => item.postalCircle === postalCircleId);
        const postalCircle = await PostalCircle.findById(postalCircleId);

        if (!postalCircle) {
          return res.status(404).json({ message: `Postal circle ${postalCircleId} not found` });
        }

        let circleTotal = 0;
        for (const item of itemsForCircle) {
          const philatelicItem = await PhilatelicItem.findById(item.philatelicItem);
          if (!philatelicItem || philatelicItem.stock < item.quantity) {
            return res.status(400).json({ message: `Insufficient stock for item ${item.philatelicItem}` });
          }

          philatelicItem.stock -= item.quantity;
          circleTotal += item.price * item.quantity;
          await philatelicItem.save();
        }

        postalCircle.total_revenue += circleTotal;
        await postalCircle.save();

        const order = await Order.create({
          user: userId,
          items: itemsForCircle,
          totalAmount: circleTotal,
          paymentMethod: 'stripe',
          paymentStatus: 'paid',
          orderStatus: 'processing',
        });

        orders.push(order);
      }

      res.status(200).json({ message: 'Payment verified, orders created', orders });
    } else {
      res.status(400).json({ message: 'Payment not completed' });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: 'Error verifying payment', error });
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
