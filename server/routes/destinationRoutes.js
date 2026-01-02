const express = require("express");
const router = express.Router();
const Tour = require("../models/Tour");
const City = require("../models/City");
const Country = require("../models/Country");

router.get("/", async (req, res) => {
  try {
    // 1. Fetch all Tours and populate their linked Country and City data
    const tours = await Tour.find()
        .populate('countryId')
        .populate('cityId');

    if (!tours || tours.length === 0) {
        console.log("⚠️ No Tours found in database.");
        // Return 200 with empty array instead of 404 to prevent frontend crashes
        return res.json([]); 
    }

    // 2. Translate the data into the structure the Frontend expects
    const responseData = [];

    for (const tour of tours) {
        // Skip if data is broken (orphaned records)
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
        continent.countries.push({
            _id: tour._id,
            name: country.name,             // Subtitle (e.g. France)
            city: tour.name,                // Title (e.g. Paris Essentials)
            realCityName: city.name,        // For search filtering
            price: `$${tour.price}`,
            image: tour.images && tour.images.length > 0 ? tour.images[0] : "",
            desc: tour.overview,
            rating: tour.stats?.rating || 4.5,
            reviews: tour.stats?.reviewsCount || 0,
            duration: tour.duration,
            groupSize: tour.groupSize,
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