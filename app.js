// app.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const postalCircleRoutes = require('./routes/postalCircle.route');
const philatelicItemRoutes = require('./routes/philatelicItem.route');
const createCircleRoutesByAdmin = require('./routes/admin.route');
const authRoutes = require('./routes/auth.route');
const pdaRoutes = require('./routes/pda.route');
const eventRoutes = require('./routes/event.route');
const newsRoutes = require('./routes/news.route');
const userRoutes = require('./routes/user.route');
const walletRoutes = require('./routes/wallet.route');
const paymentRoutes = require('./routes/payment.route');
const subscriberRoutes = require('./routes/subscriber.route');

const cookieParser = require('cookie-parser');


const postRoutes = require("./routes/community-post.route");
const reactionRoutes = require("./routes/community-reaction.route");
const commentRoutes = require("./routes/Community-comments.route");
const galleryRoutes = require('./routes/gallery.route');
const pdaOrderRoutes = require("./routes/PdaOrder.route")

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173', // Allow only your frontend origin
  credentials: true // Include cookies if needed
}));

app.use('/api/auth', authRoutes); 
app.use('/api/postal-circles', postalCircleRoutes);
app.use('/api/philatelic-items', philatelicItemRoutes);
app.use('/api/pda', pdaRoutes); 
app.use('/api/events', eventRoutes); 
app.use('/api/news', newsRoutes);
app.use('/api/user', userRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/admin', createCircleRoutesByAdmin);
app.use('/api/payment', paymentRoutes);
app.use('/api/subscribers', subscriberRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/reactions", reactionRoutes);
app.use("/api/comments", commentRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/pdaOrders',pdaOrderRoutes);
// app.use((req, res) => {
//   res.status(404).json({ message: 'Resource not found' });
// });
module.exports = app;
