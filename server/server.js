require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const destinationRoutes = require("./routes/destinationRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

const allowedOrigins = [
  "http://127.0.0.1:5500",            
  "http://localhost:5500",            
  "https://travia-client-side.vercel.app" 
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        origin.endsWith(".vercel.app")
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);
app.use(express.json());

// Database Connect

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Mongo Database connected Succesfully !");
  } catch (error) {
    console.log("❌ Failed to Connect to Mongo Database!", error);
    process.exit(1);
  }
};

connectDB();

// Use Routes ->

app.use("/api/destinations", destinationRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

// Test the route from the Render Server (Only used for UptimeRobot Config!)

app.get("/api/test", (req, res) => {
  res.json({ message: "Hello, the Backend Server is now live! 👋" });
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`🚀 Server is Running on localhost:${PORT}`);
});
