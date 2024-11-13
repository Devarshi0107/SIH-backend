const axios = require('axios');
const { getShiprocketToken } = require('../config/shiprocket');

// Create order in Shiprocket
async function createShiprocketOrder(order, user, item) {
  try {
    const token = await getShiprocketToken();
    // console.log("Token:", token);

const response = await axios.post(
  'https://apiv2.shiprocket.in/v1/external/orders/create/adhoc',
  {
    order_id: order._id.toString(),
    order_date: new Date(order.createdAt).toISOString().slice(0, 16).replace('T', ' '),  // Format as yyyy-mm-dd hh:mm
    pickup_location: "Primary",  // Match to a registered pickup location in Shiprocket
    channel_id: "",  // Explicitly add channel ID if it's blank
    comment: "Reseller: M/s Goku",
    billing_customer_name: user.name,
    billing_last_name: user.lastName || "",
    billing_address: user.address.street,  // Format as string, not object
    billing_address_2: "Near Hokage House",  // Optional but aligned with example
    billing_city: user.address.city,
    billing_pincode: user.address.pincode,
    billing_state: user.address.state,
    billing_country: "India",
    billing_email: user.email,
    billing_phone: user.phone,
    shipping_is_billing: true,
    order_items: [
      {
        name: item.name,
        sku: item._id.toString(),
        units: order.items[0].quantity,
        selling_price: item.price,
        discount: "",  // Explicitly add empty discount
        tax: "",       // Explicitly add empty tax if no tax
        hsn: 441122    // Example HSN code
      }
    ],
    payment_method: order.paymentMethod === 'stripe' ? 'Prepaid' : 'COD',
    shipping_charges: 0,
    giftwrap_charges: 0,
    transaction_charges: 0,
    total_discount: 0,
    sub_total: item.price * order.items[0].quantity,  // Ensure correct subtotal
    length: 10,
    breadth: 15,
    height: 20,
    weight: 2.5
  },
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

    return response.data.order_id;
  } catch (error) {
    console.error('Error creating Shiprocket order:', error.message);
    throw new Error('Failed to create order in Shiprocket');
  }
}



async function getShiprocketOrderStatus(orderId) {
  try {
    const token = await getShiprocketToken();
  
    const response = await axios.get(
      `https://apiv2.shiprocket.in/v1/external/orders/show/${orderId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data.data.status;  // Adjust this based on the actual response structure from Shiprocket
  } catch (error) {
    console.error('Error fetching Shiprocket order status:', error.message);
    throw new Error('Failed to fetch Shiprocket order status');
  }
}

module.exports = { createShiprocketOrder ,getShiprocketOrderStatus};
