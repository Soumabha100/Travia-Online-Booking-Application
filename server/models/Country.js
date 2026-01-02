const mongoose = require('mongoose');

const countrySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    continent: { type: String, required: true },
    isoCode: { type: String, required: true, index: true },
    
    // SECTION 2.1: Strategic Market Data
    marketYieldTier: { type: String, enum: ['Low', 'Medium', 'High'] },
    annualVisitors: Number,
    
    // FIX: Add 'Visa On Arrival' to the enum list below
    visaPolicy: { 
        type: String, 
        enum: ['Visa Free', 'E-Visa', 'Visa Required', 'Schengen', 'Visa On Arrival'] 
    },

    currency: { type: String, default: "USD" },
    backgroundImage: String
});

module.exports = mongoose.model('Country', countrySchema);