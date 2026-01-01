
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

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

// Database Schemas 

const destinationSchema = new mongoose.Schema ({
    name: String,
    countries: [
        {
            name: String,  
            city: String,  
            price: String,
            image: String,
            desc: String,
            longDesc: String,
            rating: Number,
            reviews: Number,
            duration: String,
            groupSize: String,
            placesToVisit: [String] 
        }
    ]
});

const bookingSchema = new mongoose.Schema({
    guestName: String,
    destination: String,
    date: Date,
    guests: Number,
    totalPrice: String,
    tax: String,
    status: { type: String, default: 'Confirmed' },
    createdAt: { type: Date, default: Date.now }
});

// Models

const Destination = mongoose.model("Destination", destinationSchema);
const Booking = mongoose.model("Booking", bookingSchema);

// API Routes

app.get("/api/destinations", async (req, res) => {
    try {
        // console.log("📡 API Hit: Fetching destinations...");
        const getAllDestinations = await Destination.find();

        if (!getAllDestinations || getAllDestinations.length === 0) {
            console.log( "⚠️ Database is Empty!");
            return res.status(404).json({message: "No Data is Found!"});
        }
        res.json(getAllDestinations);
        // console.log(`✅ Sent ${getAllDestinations.length} objects to frontend`)

    } catch (error) {
        console.error("❌ API Error!", error);
        res.status(500).json({ message: "Server Error!"});
    }
});

app.post("/api/bookings", async (req, res) => {
    try {
        const newBooking = new Booking(req.body);

        await newBooking.save();

         res.status(201).json({ message: "Booking Saved!", booking: newBooking});
    } catch (error) {
        res.status(500).json({ message: "Error Saving the Booking!"});
    }
});

const PORT = 8001;

app.listen(PORT, () => {
    console.log(`🚀 Server is Running on localhost:${PORT}`);
})