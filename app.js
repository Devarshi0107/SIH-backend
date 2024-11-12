// app.js
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const postalCircleRoutes = require('./routes/postalCircle.route');
const philatelicItemRoutes = require('./routes/philatelicItem.route');
const createCircleRoutesByAdmin = require('./routes/admin.route');
const authRoutes = require('./routes/auth.route');
const pdaRoutes = require('./routes/pda.route');
const eventRoutes = require('./routes/event.route');
const newsRoutes = require('./routes/news.route');
const userRoutes = require('./routes/user.routes');
const walletRoutes = require('./routes/wallet.route');


dotenv.config();
connectDB();

const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes); 

app.use('/api/pda', pdaRoutes); 

app.use('/api/postal-circles', postalCircleRoutes);
app.use('/api/philatelic-items', philatelicItemRoutes);
app.use('/api/events', eventRoutes); 
app.use('/api/news', newsRoutes);
app.use('/api/user', userRoutes);
app.use('/api/wallet', walletRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Resource not found' });
});

module.exports = app;
