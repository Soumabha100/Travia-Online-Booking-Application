const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

// POST a new booking
router.post('/', async (req, res) => {
    try {
        const newBooking = new Booking(req.body);
        await newBooking.save();
        res.status(201).json({ message: "Booking Confirmed!", booking: newBooking });
    } catch (error) {
        res.status(500).json({ message: "Booking Failed", error: error.message });
    }
});

module.exports = router;