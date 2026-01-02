const express = require("express");
const router = express.Router();
// We now use the 'Tour' model instead of the old 'Destination' model
const Tour = require("../models/Tour");

router.get("/", async (req, res) => {
  try {
    // 1. Fetch all Tours and populate their linked Country and City data
    // This pulls in the "Real" data (Currency, Visa, Prices)
    const tours = await Tour.find()
        .populate('countryId')
        .populate('cityId');

    if (!tours || tours.length === 0) {
        console.log("⚠️ No Tours found in database.");
        return res.status(404).json({ message: "No Data Found" });
    }

    // 2. Translate the data into the structure the Frontend expects
    // Structure: [ { name: "Europe", countries: [ { ...tourData } ] }, ... ]
    const responseData = [];

    for (const tour of tours) {
        // Skip if data is incomplete
        if (!tour.countryId || !tour.cityId) continue;

        const country = tour.countryId;
        const city = tour.cityId;
        const continentName = country.continent;

        // A. Find or Create the Continent Bucket
        let continent = responseData.find(c => c.name === continentName);
        if (!continent) {
            continent = { name: continentName, countries: [] };
            responseData.push(continent);
        }

        // B. Format the Tour Object
        // This maps your database fields to the names used in 'destinations.js'
        continent.countries.push({
            _id: tour._id,
            
            // Titles
            name: country.name,             // e.g., "France" (Subtitle)
            city: tour.name,                // e.g., "Paris Essentials" (Main Title)
            realCityName: city.name,        // e.g., "Paris" (For searching)
            
            // Inventory
            price: `$${tour.price}`,        // Format as string for frontend
            image: tour.images && tour.images.length > 0 ? tour.images[0] : "",
            desc: tour.overview,
            
            // Stats
            rating: tour.stats?.rating || 4.5,
            reviews: tour.stats?.reviewsCount || 0,
            
            // Details
            duration: tour.duration,
            groupSize: tour.groupSize,
            
            // Intelligence Data (The New Realism Fields)
            visa: country.visaPolicy,
            currency: country.currency,
            isTrending: tour.stats?.isTrending
        });
    }

    // 3. Send the formatted data
    res.json(responseData);

  } catch (error) {
    console.error("❌ API Error in destinationRoutes:", error);
    res.status(500).json({ message: "Server Error fetching destinations" });
  }
});

module.exports = router;