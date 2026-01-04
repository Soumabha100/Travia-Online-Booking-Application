const mongoose = require("mongoose");

const tourSchema = new mongoose.Schema(
  {
    // 1. Identity & Relations (Correct)
    name: { type: String, required: true, trim: true },
    cityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "City",
      required: true,
    },
    countryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
      required: true,
    },

    // 2. NEW: Classification & Filtering (The Optimization)
    category: {
      type: String,
      enum: ["Adventure", "Relaxation", "History", "Culture", "Food", "Nature"],
      required: true,
    },

    // 3. Inventory & Logistics
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number }, // Optional: For "Strike-through" pricing (e.g. $500 -> $450)
    duration: { type: String, required: true }, // e.g. "5 Days"
    groupSize: { type: String, required: true }, // e.g. "Max 12"

    // 4. Content & Marketing
    overview: { type: String, required: true }, // The long description
    highlights: [String], // NEW: Quick bullets (e.g. "Sunset Cruise included", "Skip-the-line")
    images: [String],
    itinerary: [
      {
        day: Number,
        title: String,
        desc: String,
      },
    ],
    amenities: [String], // Utilities (e.g. "WiFi", "AC", "Pool")

    // 5. Sentiment & Stats (Your existing logic)
    stats: {
      rating: { type: Number, default: 0, min: 0, max: 5 },
      reviewsCount: { type: Number, default: 0 },
      breakdown: {
        verified: Number,
        volume: Number,
        nlpSentiment: Number,
      },
      isTrending: { type: Boolean, default: false }, // Auto-calculated popularity
    },

    // Manual Override for Admin
    isFeatured: { type: Boolean, default: false }, // Admin picks
  },
  { timestamps: true }
); // Adds createdAt/updatedAt automatically

module.exports = mongoose.model("Tour", tourSchema);
