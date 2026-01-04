const mongoose = require("mongoose");

const citySchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Paris"
  countryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Country",
    required: true,
  },
  location: {
    type: { type: String, default: "Point" },
    coordinates: [Number], // [Longitude, Latitude] for Geo-Indexing
  },

  description: { type: String }, // General intro (e.g. "The City of Lights...")
  topAttractions: [String], // e.g. ["Eiffel Tower", "Louvre"] - Replaces 'placesToVisit'
  images: [String], // Static Images for the City

  // SECTION 3.1: Economic Modelling
  economics: {
    minDailyBudget: Number, // e.g., 265 (USD)
    accommodationCost: Number, // 10th percentile hotel cost
    mealIndex: Number, // Cost of 3 meals
    transitCost: Number, // Taxi/Metro cost
    currencyStrength: { type: String, enum: ["Weak", "Stable", "Strong"] }, // e.g., "Weak" for Yen
  },

  // SECTION 5.4: Metadata
  timeZone: String, // e.g., "Europe/Paris"
  popularityIndex: { type: Number, min: 0, max: 100 },
});

citySchema.index({ location: "2dsphere" }); // Enable "Search by Map"
module.exports = mongoose.model("City", citySchema);
