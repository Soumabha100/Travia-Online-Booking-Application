const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }, // e.g., "Europe", "Asia"
    countries: [
        {
            name: { type: String, required: true }, // e.g., "Switzerland"
            city: { type: String, required: true }, // e.g., "Zurich"
            price: { type: String, required: true },
            image: { type: String, required: true }, // URL string
            desc: { type: String, required: true },
            longDesc: { type: String }, // Detailed description
            rating: { type: Number, default: 0 },
            reviews: { type: Number, default: 0 },
            duration: { type: String },
            groupSize: { type: String },
            placesToVisit: [{ type: String }] // Array of strings
        }
    ]
});

module.exports = mongoose.model('Destination', destinationSchema);