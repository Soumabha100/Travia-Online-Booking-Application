const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
    name: { type: String, required: true }, 
    cityId: { type: mongoose.Schema.Types.ObjectId, ref: 'City' }, 
    countryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Country', required: true },
    
    // Inventory
    price: { type: Number, required: true },
    duration: String,      // "5 Days"
    groupSize: String,     // "Max 12"
    
    // SECTION 4.2: Sentiment Architecture
    stats: {
        rating: { type: Number, default: 0 }, // Weighted Global Score
        reviewsCount: { type: Number, default: 0 },
        breakdown: {
            verified: Number, // Booking.com score
            volume: Number,   // TripAdvisor score
            nlpSentiment: Number // AI Score
        },
        isTrending: { type: Boolean, default: false }
    },

    images: [String],
    overview: String,
    itinerary: [{ day: Number, title: String, desc: String }],
    amenities: [String] // e.g., "WiFi", "Pool" (Section 5.3)
});

module.exports = mongoose.model('Tour', tourSchema);