const express = require('express');
const router = express.Router();
const Tour = require('../models/Tour');

// Public Route: GET /api/destinations
router.get('/', async (req, res) => {
    try {
        // 1. Fetch Tours with all related "Intelligence"
        const tours = await Tour.find()
            .populate('countryId')
            .populate('cityId');

        // 2. The "Translator" Logic
        const responseData = [];

        for (const tour of tours) {
            const country = tour.countryId;
            const city = tour.cityId;
            
            if (!country || !city) continue;

            const continentName = country.continent;

            // Find or Create Continent bucket
            let continent = responseData.find(c => c.name === continentName);
            if (!continent) {
                continent = { name: continentName, countries: [] };
                responseData.push(continent);
            }

            // Create the "Smart Card" data
            continent.countries.push({
                _id: tour._id,
                
                // Display Info
                name: country.name,           // "France"
                city: tour.name,              // "Paris Essentials" (Tour Name)
                realCityName: city.name,      // "Paris" (For filters)
                
                // Inventory & Price
                price: `$${tour.price}`,
                image: tour.images[0],
                desc: tour.overview,
                
                // Realism Data (The New Fields)
                rating: tour.stats.rating,
                reviews: tour.stats.reviewsCount,
                duration: tour.duration,
                groupSize: tour.groupSize,
                
                // Strategic Badges
                visa: country.visaPolicy,
                currency: country.currency,
                isTrending: tour.stats.isTrending,
                yieldTier: country.marketYieldTier // Used for styling (Gold border for High yield?)
            });
        }

        res.json(responseData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;