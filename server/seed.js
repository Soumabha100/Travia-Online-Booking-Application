require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// 1. Define the Schema (Must match server.js)
const destinationSchema = new mongoose.Schema({
    name: String, 
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

const Destination = mongoose.model('Destination', destinationSchema);

// 2. Connect to DB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB for Smart Seeding'))
    .catch(err => console.error(err));

// 3. Read the JSON File
// FIX: Pointing to the correct client folder location
const jsonPath = path.join(__dirname, '../client/pages/destinations.json'); 

const importData = async () => {
    try {
        console.log('📖 Reading data from destinations.json...');
        const destinations = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

        // 4. Smart Loop (The Optimization)
        for (const regionData of destinations) {
            // Step A: Check if the Region (e.g., "Europe") exists
            const existingRegion = await Destination.findOne({ name: regionData.name });

            if (!existingRegion) {
                // Scenario 1: Region doesn't exist -> Create it entirely
                await Destination.create(regionData);
                console.log(`✨ Created NEW Region: ${regionData.name}`);
            } else {
                // Scenario 2: Region exists -> Check for new countries to add
                console.log(`ℹ️  Region '${regionData.name}' found. Checking for new countries...`);
                
                let newCountriesCount = 0;

                for (const newCountry of regionData.countries) {
                    // Check if this country already exists in the DB
                    const countryExists = existingRegion.countries.some(
                        dbCountry => dbCountry.name === newCountry.name || dbCountry.city === newCountry.city
                    );

                    if (!countryExists) {
                        // It's a new country! Push it to the array.
                        existingRegion.countries.push(newCountry);
                        newCountriesCount++;
                        console.log(`   ➕ Adding ${newCountry.city}, ${newCountry.name}`);
                    }
                }

                if (newCountriesCount > 0) {
                    await existingRegion.save();
                    console.log(`   ✅ Saved ${newCountriesCount} new countries to ${regionData.name}.`);
                } else {
                    console.log(`   ---- No new data for ${regionData.name}.`);
                }
            }
        }

        console.log('🎉 Database Synchronization Complete!');
        process.exit();
    } catch (error) {
        console.error('❌ Error with data import:', error);
        process.exit(1);
    }
};

importData();