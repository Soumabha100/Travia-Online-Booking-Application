
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const destinationRoutes = require('./routes/destinationRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Database Connect

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Mongo Database connected Succesfully !");
    } catch (error) {
        console.log("❌ Failed to Connect to Mongo Database!", error);
        process.exit(1);
    }
};

connectDB();

// Use Routes ->

app.use('/api/destinations' , destinationRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);


const PORT = 8001;

app.listen(PORT, () => {
    console.log(`🚀 Server is Running on localhost:${PORT}`);
})