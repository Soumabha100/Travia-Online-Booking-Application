// backend/seed.js
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
    .then(() => console.log('✅ Connected to MongoDB for Seeding'))
    .catch(err => console.error(err));

// 3. Read the JSON File
// Note: Adjust the path '../pages/destinations.json' if your folder structure differs
const jsonPath = path.join(__dirname, '../pages/destinations.json'); 
const destinations = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

// 4. Import Data
const importData = async () => {
    try {
        await Destination.deleteMany(); // Clear existing data to avoid duplicates
        console.log('🗑️  Old data cleared...');

        await Destination.insertMany(destinations);
        console.log('🌱 Data Imported Successfully!');

        process.exit();
    } catch (error) {
        console.error('❌ Error with data import:', error);
        process.exit(1);
    }
};

importData();