const User = require("../models/User.model");
const Pda = require("../models/PDA.model");

const stripe = require("../config/stripe.config");

exports.createPaymentIntent = async (req, res) => {
  const { amount, email, userId } = req.body;

  try {
    // Validate minimum amount (₹42 in paise)
    const MIN_AMOUNT_INR = 42; // Minimum INR amount
    if (amount < MIN_AMOUNT_INR) {
      return res.status(400).json({ error: `Minimum amount is ₹${MIN_AMOUNT_INR}.` });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: { name: "Wallet Balance Top-Up" },
            unit_amount: amount * 100, // Convert amount to paise
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url:
        "http://localhost:5173/checkout-success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "http://localhost:5173/",
      customer_email: email,
      metadata: {
        userId: userId,
        amount: amount,
      },
    });

    console.log("Session created successfully:", session);

    res.send({ url: session.url });
  } catch (error) {
    console.error("Error creating session:", error);
    res.status(500).json({ error: error.message });
  }
};

  

exports.verifyPayment = async (req, res) => {
  const { session_id } = req.query;

  try {
    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);
    console.log("Session Retrieved:", session);

    // Retrieve the associated payment intent to access metadata
    // const paymentIntent = await stripe.paymentIntents.retrieve(
    //   session.payment_intent
    // );
    // console.log("Payment Intent Retrieved:", paymentIntent);

    // Parse formData from metadata
    // const formData = JSON.parse(paymentIntent.metadata.formData);

    // Extract the relevant data
    const amountData = {
      id: session.id,
      amount: session.amount_total / 100, // Convert amount from cents to main currency unit
      email: session.customer_details.email,
      payment_status: "paid",
    //   formData: formData,
    };

    console.log("Amount Data:", amountData);

    // Send the extracted data to the client
    res.json(amountData);

    // Update the user's wallet balance if payment was successful
    if (session.payment_status === "paid") {
      const user = await User.findOne({ email: session.customer_details.email });
      if (user) {
        user.wallet_balance += amountData.amount;
         // Add the payment amount to the user's wallet balance
        await user.save();
        console.log("User wallet updated successfully.");
        const pda = await Pda.findOne({ user: user._id })
        if(pda){
          console.log(typeof(amountData.amount));
          pda.balance += amountData.amount;

          await pda.save();
          console.log("Pda balance:", pda.balance);
        }
      }

    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ error: "Failed to verify payment and update wallet balance." });
  }
}

// Controller to get wallet balance for a user
exports.getWalletBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user._id); // Assuming `req.user._id` is set by the `authMiddleware`

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Respond with the user's wallet balance
    res.status(200).json({ wallet_balance: user.wallet_balance });
  } catch (error) {
    console.error("Error fetching wallet balance:", error);
    res.status(500).json({ error: "Failed to fetch wallet balance" });
  }
};
