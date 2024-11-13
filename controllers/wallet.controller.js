
const User = require('../models/User.model');

const stripe = require('../config/stripe.config');

exports.createPaymentIntent = async (req, res) => {
    const { amount, email, userId } = req.body;

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'inr',
                        product_data: { name: 'Wallet Balance Top-Up' },
                        unit_amount: amount * 100,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: 'http://localhost:5173/checkout-success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: 'http://localhost:5173/',
            customer_email: email,
            metadata: {
                userId: userId,
                amount: amount
            },
        });

        res.send({ url: session.url });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.verifyPayment = async (req, res) => {
    const { session_id } = req.query;

    try {
        // Retrieve the Stripe session with expanded line items
        const session = await stripe.checkout.sessions.retrieve(session_id, {
            expand: ["line_items.data.price.product"],
        });

        // Extract the amount and other details
        const amountData = {
            id: session.id,
            amount: session.amount_total / 100, // Convert cents to main currency unit
            email: session.customer_details.email,
            lineItems: session.line_items.data.map((item) => ({
                name: item.price.product.name,
                quantity: item.quantity,
                amount: item.price.unit_amount / 100, // Convert cents to main currency unit
            })),
        };

        // Send order data to the client for confirmation
        res.json(amountData);


        // Update the user's wallet balance if payment was successful
        if (session.payment_status === 'paid') {
            const user = await User.findOne({ email: session.customer_details.email });
            if (user) {
                user.wallet_balance += amountData.amount; // Add the payment amount to the user's wallet balance
                await user.save();
               
            }
        }
    } catch (error) {
        console.error("Error verifying payment:", error);
        // res.status(500).json({ error: "Failed to verify payment and update wallet balance" });
    }
};
  