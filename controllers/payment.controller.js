// controllers/payment.controller.js
const Order = require('../models/Order.model');
const User = require('../models/User.model');
const PostalCircle = require('../models/PostalCircle.model');
const PhilatelicItem = require('../models/PhilatelicItem.model'); 
const WalletTransaction = require('../models/WalletTransaction.model');
const stripe = require('../config/stripe.config');

// controllers/payment.controller.js
exports.processPaymentAndOrder = async (req, res) => {
  const { itemId, quantity, paymentMethod, postalCircleId } = req.body;
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


// controllers/payment.controller.js
exports.verifyPayment = async (req, res) => {
  const { session_id } = req.query;

  try {
    // Retrieve the Stripe session with expanded line items
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["line_items.data.price.product"],
    });

    // Extract session details
    const userId = session.metadata.userId;
    const itemId = session.metadata.itemId;
    const quantity = parseInt(session.metadata.quantity, 10);
    const postalCircleId = session.metadata.postalCircleId;
    const totalAmount = session.amount_total / 100; // Convert cents to main currency unit

    // Check if payment was successful
    if (session.payment_status === 'paid') {
      // Find user, item, and postal circle by their IDs
      const user = await User.findById(userId);
      const item = await PhilatelicItem.findById(itemId);
      const postalCircle = await PostalCircle.findById(postalCircleId);

      if (!user || !item || !postalCircle) {
        return res.status(404).json({ message: 'User, item, or postal circle not found' });
      }

      // Update postal circle revenue
      postalCircle.total_revenue += totalAmount;
      await postalCircle.save();

      // Reduce stock quantity of the item
      item.stock -= quantity;
      if (item.stock < 0) {
        item.stock = 0; // Ensure stock does not go negative
      }
      await item.save();

      // Update or create the order with payment confirmation
      const order = await Order.create({
        user: userId,
        postalCircle: postalCircleId,
        items: [{ philatelicItem: itemId, quantity, price: item.price }],
        totalAmount,
        paymentMethod: 'stripe',
        paymentStatus: 'paid',
        orderStatus: 'processing'
      });

      res.status(200).json({
        message: 'Payment verified and order placed successfully',
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
