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


const sendMail = require('../utils/mailer'); // Import mailer utility

exports.processPaymentAndOrder = async (req, res) => {
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

    // Calculate total amount and validate stock
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
      });
    }

    // Validate wallet balance
    if (user.wallet_balance < totalAmount) {
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }

    // Deduct wallet balance and save user
    user.wallet_balance -= totalAmount;
    user.cart = []; // Clear the cart after payment
    await user.save();

    // Create the order
    const order = await Order.create({
      user: userId,
      items: orderItems,
      totalAmount,
      paymentMethod: 'wallet',
      paymentStatus: 'paid',
      orderStatus: 'processing',
    });

    // Send email notification
    await sendMail(
      user.email,
      'Order Created Successfully',
      `Your order has been created successfully. Admin will review your order and fulfill the items based on the policies.\n\nOrder ID: ${order._id}\nTotal Amount: ₹${totalAmount}`
    );

    res.status(201).json({
      message: 'Order created successfully',
      orderId: order._id,
      totalAmount,
    });
  } catch (error) {
    console.error('Error processing payment and order:', error);
    res.status(500).json({ message: 'Error processing payment or placing order', error });
  }
};

exports.processPaymentAndOrder = async (req, res) => {
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

    // Calculate total amount and validate stock
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
      });
    }

    // Validate wallet balance
    if (user.wallet_balance < totalAmount) {
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }

    // Deduct wallet balance and save user
    user.wallet_balance -= totalAmount;
    user.cart = []; // Clear the cart after payment
    await user.save();

    // Create the order
    const order = await Order.create({
      user: userId,
      items: orderItems,
      totalAmount,
      paymentMethod: 'wallet',
      paymentStatus: 'paid',
      orderStatus: 'processing',
    });

    res.status(201).json({
      message: 'Order created successfully',
      orderId: order._id,
      totalAmount,
    });
  } catch (error) {
    console.error('Error processing payment and order:', error);
    res.status(500).json({ message: 'Error processing payment or placing order', error });
  }
};
exports.fulfillOrder = async (req, res) => {
  const { orderId } = req.params;
  const { fulfilledItems } = req.body; // [{ philatelicItem: "itemId", fulfilledQuantity: 10 }]

  try {
    const order = await Order.findById(orderId).populate('items.philatelicItem');
    const user = await User.findById(order.user);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update fulfillment
    for (const item of fulfilledItems) {
      const orderItem = order.items.find(i => i.philatelicItem._id.toString() === item.philatelicItem);

      if (!orderItem) {
        return res.status(400).json({ message: `Item ${item.philatelicItem} not found in order` });
      }

      if (orderItem.philatelicItem.stock < item.fulfilledQuantity) {
        return res.status(400).json({ message: `Insufficient stock for item ${orderItem.philatelicItem.name}` });
      }

      orderItem.fulfilledQuantity = item.fulfilledQuantity;
      orderItem.philatelicItem.stock -= item.fulfilledQuantity;
      await orderItem.philatelicItem.save();
    }

    // Update order status
    const isFullyFulfilled = order.items.every(i => i.quantity === i.fulfilledQuantity);
    order.orderStatus = isFullyFulfilled ? 'fulfilled' : 'partially_fulfilled';
    order.fulfilledByAdmin = true;
    await order.save();

    // Send email notification
    const fulfilledDetails = fulfilledItems
      .map(item => `Item ID: ${item.philatelicItem}, Fulfilled Quantity: ${item.fulfilledQuantity}`)
      .join('\n');
    await sendMail(
      user.email,
      'Order Fulfillment Update',
      `Your order has been updated by the admin.\n\nOrder ID: ${order._id}\nFulfillment Details:\n${fulfilledDetails}\n\nCurrent Order Status: ${order.orderStatus}`
    );

    res.status(200).json({ message: 'Order fulfilled successfully', order });
  } catch (error) {
    console.error('Error fulfilling order:', error);
    res.status(500).json({ message: 'Error fulfilling order', error });
  }
};
