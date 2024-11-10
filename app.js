// app.js
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const postalCircleRoutes = require('./routes/postalCircleRoutes');
const philatelicItemRoutes = require('./routes/philatelicItemRoutes');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

app.use('/api/postal-circles', postalCircleRoutes);
app.use('/api/philatelic-items', philatelicItemRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Resource not found' });
});

module.exports = app;
