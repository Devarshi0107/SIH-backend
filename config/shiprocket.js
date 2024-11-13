const axios = require('axios');
let shiprocketToken = null;
let tokenExpiry = null;

// Fetch a new token if expired
async function getShiprocketToken() {
  const currentTime = new Date().getTime();

  if (shiprocketToken && tokenExpiry && currentTime < tokenExpiry) {
    return shiprocketToken;
  }

  try {
    const response = await axios.post('https://apiv2.shiprocket.in/v1/external/auth/login', {
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    });

    shiprocketToken = response.data.token;
    tokenExpiry = currentTime + 15 * 60 * 1000; // 15-minute expiry

    return shiprocketToken;
  } catch (error) {
    console.error('Error fetching Shiprocket token:', error.message);
    throw new Error('Failed to authenticate with Shiprocket');
  }
}

module.exports = { getShiprocketToken };
