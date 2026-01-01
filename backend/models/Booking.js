const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    guestName: { type: String, required: true },
    destination: { type: String, required: true },
    date: { type: Date, required: true },
    guests: { type: Number, required: true, min: 1 },
    totalPrice: String,
    tax: String,
    status: { type: String, default: 'Confirmed' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);