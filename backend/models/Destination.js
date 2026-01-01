const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
    name: { type: String, required: true },
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

module.exports = mongoose.model('Destination', destinationSchema);