const mongoose = require('mongoose');
const Country = require('./models/Country');
const City = require('./models/City');
const Tour = require('./models/Tour');
require('dotenv').config();

// ==========================================
// 1. INTELLIGENCE LAYERS (Data from your Report)
// ==========================================

// Report Section 2.1 - 2.4: Strategic Country Data
const countryIntelligence = {
    "Switzerland": { iso: "CH", yield: "High", visa: "Schengen", currency: "CHF", visitors: 12000000 },
    "France": { iso: "FR", yield: "Medium", visa: "Schengen", currency: "EUR", visitors: 102000000 },
    "Italy": { iso: "IT", yield: "Medium", visa: "Schengen", currency: "EUR", visitors: 57000000 },
    "Germany": { iso: "DE", yield: "Medium", visa: "Schengen", currency: "EUR", visitors: 37000000 },
    "Greece": { iso: "GR", yield: "Medium", visa: "Schengen", currency: "EUR", visitors: 36000000 },
    "Portugal": { iso: "PT", yield: "Medium", visa: "Schengen", currency: "EUR", visitors: 22000000 },
    "Austria": { iso: "AT", yield: "High", visa: "Schengen", currency: "EUR", visitors: 26000000 },
    "United Kingdom": { iso: "GB", yield: "High", visa: "E-Visa", currency: "GBP", visitors: 41000000 },
    "Netherlands": { iso: "NL", yield: "High", visa: "Schengen", currency: "EUR", visitors: 20000000 },
    "Croatia": { iso: "HR", yield: "Medium", visa: "Schengen", currency: "EUR", visitors: 15000000 },
    "India": { iso: "IN", yield: "Low", visa: "E-Visa", currency: "INR", visitors: 18000000 },
    "Japan": { iso: "JP", yield: "High", visa: "Visa Free", currency: "JPY", visitors: 36000000 },
    "Thailand": { iso: "TH", yield: "Low", visa: "Visa Free", currency: "THB", visitors: 35000000 },
    "Indonesia": { iso: "ID", yield: "Low", visa: "Visa On Arrival", currency: "IDR", visitors: 11000000 },
    "Vietnam": { iso: "VN", yield: "Low", visa: "E-Visa", currency: "VND", visitors: 17000000 },
    "South Korea": { iso: "KR", yield: "High", visa: "E-Visa", currency: "KRW", visitors: 12000000 },
    "United Arab Emirates": { iso: "AE", yield: "High", visa: "Visa On Arrival", currency: "AED", visitors: 22000000 },
    "United States": { iso: "US", yield: "High", visa: "E-Visa", currency: "USD", visitors: 72000000 },
    "Canada": { iso: "CA", yield: "High", visa: "E-Visa", currency: "CAD", visitors: 20000000 },
    "Mexico": { iso: "MX", yield: "Low", visa: "Visa Free", currency: "MXN", visitors: 45000000 },
    "Brazil": { iso: "BR", yield: "Medium", visa: "Visa Free", currency: "BRL", visitors: 6000000 },
    "Peru": { iso: "PE", yield: "Low", visa: "Visa Free", currency: "PEN", visitors: 4000000 },
    "Argentina": { iso: "AR", yield: "Low", visa: "Visa Free", currency: "ARS", visitors: 7000000 },
    "Egypt": { iso: "EG", yield: "Low", visa: "Visa On Arrival", currency: "EGP", visitors: 14000000 },
    "South Africa": { iso: "ZA", yield: "Medium", visa: "Visa Required", currency: "ZAR", visitors: 8000000 },
    "Morocco": { iso: "MA", yield: "Low", visa: "Visa Free", currency: "MAD", visitors: 17000000 },
    "Australia": { iso: "AU", yield: "High", visa: "E-Visa", currency: "AUD", visitors: 9000000 },
    "New Zealand": { iso: "NZ", yield: "High", visa: "E-Visa", currency: "NZD", visitors: 3000000 }
};

// Report Section 3.2: Granular Economic Benchmarks
// (Approximated Lat/Lng and Budget for key cities)
const cityIntelligence = {
    "Zurich": { lat: 47.3769, lng: 8.5417, budget: 300 },
    "Paris": { lat: 48.8566, lng: 2.3522, budget: 265 },
    "Rome": { lat: 41.9028, lng: 12.4964, budget: 180 },
    "Berlin": { lat: 52.5200, lng: 13.4050, budget: 160 },
    "Athens": { lat: 37.9838, lng: 23.7275, budget: 140 },
    "Lisbon": { lat: 38.7223, lng: -9.1393, budget: 150 },
    "Vienna": { lat: 48.2082, lng: 16.3738, budget: 190 },
    "London": { lat: 51.5074, lng: -0.1278, budget: 280 },
    "Amsterdam": { lat: 52.3676, lng: 4.9041, budget: 220 },
    "Dubrovnik": { lat: 42.6507, lng: 18.0944, budget: 130 },
    "New Delhi": { lat: 28.6139, lng: 77.2090, budget: 60 },
    "Tokyo": { lat: 35.6762, lng: 139.6503, budget: 200 },
    "Bangkok": { lat: 13.7563, lng: 100.5018, budget: 100 },
    "Bali": { lat: -8.3405, lng: 115.0920, budget: 80 },
    "Hanoi": { lat: 21.0285, lng: 105.8542, budget: 70 },
    "Seoul": { lat: 37.5665, lng: 126.9780, budget: 180 },
    "Dubai": { lat: 25.2048, lng: 55.2708, budget: 250 },
    "New York City": { lat: 40.7128, lng: -74.0060, budget: 350 },
    "Banff": { lat: 51.1784, lng: -115.5708, budget: 220 },
    "Cancun": { lat: 21.1619, lng: -86.8515, budget: 150 },
    "Rio de Janeiro": { lat: -22.9068, lng: -43.1729, budget: 150 },
    "Cusco": { lat: -13.5320, lng: -71.9675, budget: 110 },
    "Buenos Aires": { lat: -34.6037, lng: -58.3816, budget: 100 },
    "Cairo": { lat: 30.0444, lng: 31.2357, budget: 80 },
    "Cape Town": { lat: -33.9249, lng: 18.4241, budget: 140 },
    "Marrakech": { lat: 31.6295, lng: -7.9811, budget: 120 },
    "Sydney": { lat: -33.8688, lng: 151.2093, budget: 184 },
    "Queenstown": { lat: -45.0312, lng: 168.6626, budget: 190 }
};

// ==========================================
// 2. LEGACY DATASET (The Full List)
// ==========================================
const legacyData = [
  {
    "name": "Europe",
    "countries": [
      {
        "name": "Switzerland", "city": "Zurich", "price": "$999", "image": "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=600&auto=format&fit=crop", "desc": "Breathtaking Alps, pristine lakes, and world-class Swiss chocolate.", "longDesc": "Immerse yourself in the pristine beauty of Switzerland. From the banking capital of Zurich to the adventure sports hub of Interlaken, this tour covers the best of the Swiss Alps.", "rating": 4.9, "reviews": 120, "duration": "5 Days", "groupSize": "Max 10", "placesToVisit": ["Zurich", "Lucerne", "Interlaken", "Geneva", "Zermatt"]
      },
      {
        "name": "France", "city": "Paris", "price": "$899", "image": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=600&auto=format&fit=crop", "desc": "Romance in Paris, the iconic Eiffel Tower, and exquisite cuisine.", "longDesc": "Experience the magic of France, starting with the romantic streets of Paris. Visit the Louvre, ascend the Eiffel Tower, and enjoy a cruise on the Seine.", "rating": 4.8, "reviews": 95, "duration": "6 Days", "groupSize": "Max 12", "placesToVisit": ["Paris", "Nice", "Lyon", "Bordeaux", "Versailles"]
      },
      {
        "name": "Italy", "city": "Rome", "price": "$849", "image": "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=600&auto=format&fit=crop", "desc": "Venetian canals, Roman history, and the stunning Amalfi Coast.", "longDesc": "Walk through history in Italy. Explore the Colosseum and Vatican City in Rome, ride a gondola in Venice, and admire the art of Florence.", "rating": 4.8, "reviews": 210, "duration": "7 Days", "groupSize": "Max 15", "placesToVisit": ["Rome", "Venice", "Florence", "Milan", "Amalfi Coast"]
      },
      {
        "name": "Germany", "city": "Berlin", "price": "$899", "image": "https://i.ibb.co/XZcXG2Mh/Germany-1.webp", "desc": "Historic Berlin, fairy-tale castles, and the vibrant culture of Munich.", "longDesc": "Discover the heart of Europe in Germany. Witness the history of the Berlin Wall, explore the fairytale Neuschwanstein Castle, and enjoy the lively atmosphere of Munich's beer gardens.", "rating": 4.7, "reviews": 85, "duration": "5 Days", "groupSize": "Max 12", "placesToVisit": ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne"]
      },
      {
        "name": "Greece", "city": "Athens", "price": "$799", "image": "https://i.ibb.co/N6Qvzfv1/Greece-1.webp", "desc": "Ancient Athens, sunset views in Santorini, and crystal-clear Aegean waters.", "longDesc": "Step back in time in Athens before island-hopping across the Aegean Sea. Watch the world-famous sunset in Santorini, party in Mykonos.", "rating": 4.9, "reviews": 150, "duration": "6 Days", "groupSize": "Max 10", "placesToVisit": ["Athens", "Santorini", "Mykonos", "Delphi", "Crete"]
      },
      {
        "name": "Portugal", "city": "Lisbon", "price": "$749", "image": "https://i.ibb.co/j9Rx2d2s/Portugal-1.webp", "desc": "Golden beaches of the Algarve, historic Lisbon trams, and Douro Valley wines.", "longDesc": "Portugal offers a perfect blend of culture and coast. Ride the historic trams of Lisbon, taste the famous wines of the Douro Valley.", "rating": 4.6, "reviews": 70, "duration": "5 Days", "groupSize": "Max 10", "placesToVisit": ["Lisbon", "Porto", "Sintra", "Algarve", "Faro"]
      },
      {
        "name": "Austria", "city": "Vienna", "price": "$899", "image": "https://i.ibb.co/4ZrYzS5J/Austria-1.webp", "desc": "Imperial palaces in Vienna, classical music heritage, and Alpine villages.", "longDesc": "Experience the elegance of Austria. Visit the majestic Schönbrunn Palace in Vienna, the birthplace of Mozart in Salzburg, and the stunning lakeside village of Hallstatt.", "rating": 4.7, "reviews": 60, "duration": "4 Days", "groupSize": "Max 8", "placesToVisit": ["Vienna", "Salzburg", "Hallstatt", "Innsbruck", "Graz"]
      },
      {
        "name": "United Kingdom", "city": "London", "price": "$949", "image": "https://i.ibb.co/ZRHg06ry/UK-1.webp", "desc": "London's iconic landmarks, Scottish Highlands, and royal history.", "longDesc": "From the bustling streets of London to the rugged beauty of the Scottish Highlands. See Big Ben and Buckingham Palace, then travel north.", "rating": 4.7, "reviews": 110, "duration": "6 Days", "groupSize": "Max 15", "placesToVisit": ["London", "Edinburgh", "Manchester", "Bath", "Liverpool"]
      },
      {
        "name": "Netherlands", "city": "Amsterdam", "price": "$899", "image": "https://i.ibb.co/Y6FtnX9/Netherlands-1.webp", "desc": "Scenic Amsterdam canals, colorful tulip fields, and historic windmills.", "longDesc": "Explore the artistic heritage and intricate canal system of the Netherlands. Cycle through Amsterdam, visit the Van Gogh Museum, and see the iconic windmills of Zaanse Schans.", "rating": 4.8, "reviews": 130, "duration": "4 Days", "groupSize": "Max 12", "placesToVisit": ["Amsterdam", "Rotterdam", "Utrecht", "The Hague", "Haarlem"]
      },
      {
        "name": "Croatia", "city": "Dubrovnik", "price": "$699", "image": "https://i.ibb.co/ycNLr0Qr/Croatia-1.webp", "desc": "Medieval walls of Dubrovnik, cascading waterfalls, and the Adriatic coast.", "longDesc": "Discover the pearl of the Adriatic. Walk the medieval walls of Dubrovnik, explore the stunning Plitvice Lakes National Park, and sail around the Hvar islands.", "rating": 4.9, "reviews": 90, "duration": "5 Days", "groupSize": "Max 10", "placesToVisit": ["Dubrovnik", "Split", "Hvar", "Plitvice Lakes", "Zagreb"]
      }
    ]
  },
  {
    "name": "Asia",
    "countries": [
      {
        "name": "India", "city": "New Delhi", "price": "$499", "image": "https://i.ibb.co/RGM4PYJ8/India1.webp", "desc": "The majestic Taj Mahal, vibrant festivals, and diverse culinary spices.", "longDesc": "A journey through the Golden Triangle. Start in the capital New Delhi, witness the breathtaking Taj Mahal in Agra, and explore the royal palaces of Jaipur in Rajasthan.", "rating": 4.8, "reviews": 300, "duration": "7 Days", "groupSize": "Max 20", "placesToVisit": ["New Delhi", "Agra", "Jaipur", "Mumbai", "Goa", "Kolkata", "Chennai"]
      },
      {
        "name": "Japan", "city": "Tokyo", "price": "$1,099", "image": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=600&auto=format&fit=crop", "desc": "Serene cherry blossoms, ancient temples, and Tokyo's neon future.", "longDesc": "Experience the perfect blend of tradition and modernity. Visit the neon-lit streets of Tokyo, the ancient temples of Kyoto, and see the majestic Mount Fuji.", "rating": 4.9, "reviews": 250, "duration": "8 Days", "groupSize": "Max 12", "placesToVisit": ["Tokyo", "Kyoto", "Osaka", "Hiroshima", "Nara"]
      },
      {
        "name": "Thailand", "city": "Bangkok", "price": "$699", "image": "https://i.ibb.co/QvsGhs3W/Thailand.webp", "desc": "Golden temples, bustling street markets, and turquoise island waters.", "longDesc": "Explore the Land of Smiles. From the vibrant street life and temples of Bangkok to the relaxing beaches of Phuket and the historic ruins of Ayutthaya.", "rating": 4.7, "reviews": 420, "duration": "6 Days", "groupSize": "Max 15", "placesToVisit": ["Bangkok", "Phuket", "Chiang Mai", "Ayutthaya", "Krabi"]
      },
      {
        "name": "Indonesia", "city": "Bali", "price": "$799", "image": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=600&auto=format&fit=crop", "desc": "Tropical beaches, lush rice terraces, and spiritual temple retreats.", "longDesc": "A tropical paradise awaits in Indonesia. Discover the spiritual heart of Ubud, surf the waves in Seminyak, and witness the stunning cliffs of Nusa Penida.", "rating": 4.8, "reviews": 380, "duration": "7 Days", "groupSize": "Max 10", "placesToVisit": ["Bali", "Ubud", "Jakarta", "Nusa Penida", "Komodo Island"]
      },
      {
        "name": "Vietnam", "city": "Hanoi", "price": "$599", "image": "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=600&auto=format&fit=crop", "desc": "Limestone islands, deep history, and world-famous street food.", "longDesc": "Cruise through the emerald waters of Halong Bay, wander the lantern-lit streets of Hoi An, and experience the bustling energy of Hanoi.", "rating": 4.6, "reviews": 210, "duration": "9 Days", "groupSize": "Max 18", "placesToVisit": ["Hanoi", "Halong Bay", "Ho Chi Minh City", "Hoi An", "Da Nang"]
      },
      {
        "name": "South Korea", "city": "Seoul", "price": "$1,299", "image": "https://i.ibb.co/YFXjk46D/South-Korea1.webp", "desc": "K-Pop culture, futuristic cities, and majestic royal palaces.", "longDesc": "Where ancient tradition meets modern technology. Visit the grand Gyeongbokgung Palace, shop in the trendy districts of Myeongdong, and enjoy the vibrant nightlife.", "rating": 4.9, "reviews": 180, "duration": "7 Days", "groupSize": "Max 14", "placesToVisit": ["Seoul", "Busan", "Jeju Island", "Incheon", "Gyeongju"]
      },
      {
        "name": "United Arab Emirates", "city": "Dubai", "price": "$1,499", "image": "https://i.ibb.co/4wp7YW15/Dubai.webp", "desc": "Futuristic skylines, luxury shopping, and desert safaris.", "longDesc": "Experience ultimate luxury in the desert. Ascend the Burj Khalifa, the world's tallest building, shop at the massive Dubai Mall, and take a thrilling 4x4 safari.", "rating": 4.8, "reviews": 310, "duration": "5 Days", "groupSize": "Max 25", "placesToVisit": ["Dubai", "Abu Dhabi", "Palm Jumeirah", "Desert Safari", "Sharjah"]
      }
    ]
  },
  {
    "name": "North America",
    "countries": [
      {
        "name": "United States", "city": "New York City", "price": "$1,299", "image": "https://images.unsplash.com/photo-1496442226666-8d4a0e62e6e9?q=80&w=600&auto=format&fit=crop", "desc": "The city that never sleeps, Times Square, and Broadway shows.", "longDesc": "Experience the energy of NYC. Walk across the Brooklyn Bridge, visit the Statue of Liberty, explore Central Park, and catch a world-class show on Broadway.", "rating": 4.8, "reviews": 520, "duration": "5 Days", "groupSize": "Max 20", "placesToVisit": ["Times Square", "Central Park", "Statue of Liberty", "Empire State Building", "Brooklyn Bridge"]
      },
      {
        "name": "Canada", "city": "Banff", "price": "$1,099", "image": "https://images.unsplash.com/photo-1561134643-63305d20f5bb?q=80&w=600&auto=format&fit=crop", "desc": "Turquoise glacial lakes, Rocky Mountains, and endless forests.", "longDesc": "Immerse yourself in the Canadian Rockies. Visit the stunning Lake Louise, hike through Banff National Park, and spot wildlife like elk and bears.", "rating": 4.9, "reviews": 310, "duration": "6 Days", "groupSize": "Max 12", "placesToVisit": ["Lake Louise", "Moraine Lake", "Banff Gondola", "Johnston Canyon", "Icefields Parkway"]
      },
      {
        "name": "Mexico", "city": "Cancun", "price": "$899", "image": "https://images.unsplash.com/photo-1512813195386-6c8113a94885?q=80&w=600&auto=format&fit=crop", "desc": "White sandy beaches, Mayan ruins, and vibrant nightlife.", "longDesc": "Relax on the pristine beaches of the Caribbean coast. Explore the ancient Mayan ruins of Chichen Itza, swim in crystal-clear cenotes, and enjoy the lively nightlife.", "rating": 4.7, "reviews": 450, "duration": "5 Days", "groupSize": "Max 25", "placesToVisit": ["Chichen Itza", "Tulum", "Isla Mujeres", "Xcaret Park", "Cenote Dos Ojos"]
      }
    ]
  },
  {
    "name": "South America",
    "countries": [
      {
        "name": "Brazil", "city": "Rio de Janeiro", "price": "$999", "image": "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?q=80&w=600&auto=format&fit=crop", "desc": "Copacabana beach, Christ the Redeemer, and Carnival samba.", "longDesc": "Feel the rhythm of Rio. Visit the iconic Christ the Redeemer statue atop Mount Corcovado, take a cable car to Sugarloaf Mountain, and relax on the world-famous Copacabana.", "rating": 4.8, "reviews": 280, "duration": "6 Days", "groupSize": "Max 15", "placesToVisit": ["Christ the Redeemer", "Sugarloaf Mountain", "Copacabana", "Tijuca Forest", "Selarón Steps"]
      },
      {
        "name": "Peru", "city": "Cusco", "price": "$1,199", "image": "https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=600&auto=format&fit=crop", "desc": "Gateway to Machu Picchu, Incan history, and Andes mountains.", "longDesc": "Journey to the ancient Incan citadel of Machu Picchu. Explore the historic streets of Cusco, marvel at the Sacred Valley, and experience the breathtaking altitude of the Andes.", "rating": 4.9, "reviews": 340, "duration": "7 Days", "groupSize": "Max 10", "placesToVisit": ["Machu Picchu", "Sacred Valley", "Plaza de Armas", "San Blas", "Rainbow Mountain"]
      },
      {
        "name": "Argentina", "city": "Buenos Aires", "price": "$949", "image": "https://images.unsplash.com/photo-1612277661608-f874d01d4a0a?q=80&w=600&auto=format&fit=crop", "desc": "Tango dancing, European architecture, and world-class steak.", "longDesc": "Discover the 'Paris of South America'. Watch a passionate Tango show in La Boca, visit the historic Recoleta Cemetery, and indulge in the world's best steak and Malbec wine.", "rating": 4.7, "reviews": 210, "duration": "5 Days", "groupSize": "Max 15", "placesToVisit": ["La Boca", "Recoleta Cemetery", "Casa Rosada", "San Telmo", "Puerto Madero"]
      }
    ]
  },
  {
    "name": "Africa",
    "countries": [
      {
        "name": "Egypt", "city": "Cairo", "price": "$899", "image": "https://images.unsplash.com/photo-1539650116455-29cb533a0344?q=80&w=600&auto=format&fit=crop", "desc": "Great Pyramids of Giza, the Sphinx, and the Nile River.", "longDesc": "Walk among the pharaohs. Stand before the Great Pyramids of Giza, cruise down the Nile River on a felucca, and explore the treasures of Tutankhamun at the Egyptian Museum.", "rating": 4.8, "reviews": 400, "duration": "6 Days", "groupSize": "Max 18", "placesToVisit": ["Pyramids of Giza", "The Sphinx", "Egyptian Museum", "Khan el-Khalili", "Nile Cruise"]
      },
      {
        "name": "South Africa", "city": "Cape Town", "price": "$1,199", "image": "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?q=80&w=600&auto=format&fit=crop", "desc": "Table Mountain, penguin beaches, and vineyard tours.", "longDesc": "Experience the beauty of the Cape. Take a cable car up Table Mountain for panoramic views, visit the penguins at Boulders Beach, and taste exquisite wines in Stellenbosch.", "rating": 4.9, "reviews": 260, "duration": "7 Days", "groupSize": "Max 12", "placesToVisit": ["Table Mountain", "Boulders Beach", "Robben Island", "V&A Waterfront", "Cape Point"]
      },
      {
        "name": "Morocco", "city": "Marrakech", "price": "$799", "image": "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?q=80&w=600&auto=format&fit=crop", "desc": "Colorful souks, stunning palaces, and desert adventures.", "longDesc": "Get lost in the vibrant souks of the Medina. Visit the stunning Majorelle Garden, admire the architecture of the Bahia Palace, and take a day trip to the Atlas Mountains.", "rating": 4.7, "reviews": 310, "duration": "5 Days", "groupSize": "Max 15", "placesToVisit": ["Jemaa el-Fnaa", "Majorelle Garden", "Bahia Palace", "Koutoubia Mosque", "Atlas Mountains"]
      }
    ]
  },
  {
    "name": "Oceania",
    "countries": [
      {
        "name": "Australia", "city": "Sydney", "price": "$1,399", "image": "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=600&auto=format&fit=crop", "desc": "Sydney Opera House, Bondi Beach, and harbor cruises.", "longDesc": "Visit the iconic Sydney Opera House and Harbour Bridge. Surf at Bondi Beach, take a ferry to Manly, and enjoy the laid-back Aussie lifestyle in this stunning harbor city.", "rating": 4.9, "reviews": 380, "duration": "7 Days", "groupSize": "Max 20", "placesToVisit": ["Sydney Opera House", "Sydney Harbour Bridge", "Bondi Beach", "Darling Harbour", "Taronga Zoo"]
      },
      {
        "name": "New Zealand", "city": "Queenstown", "price": "$1,299", "image": "https://images.unsplash.com/photo-1589802829985-817e51171b92?q=80&w=600&auto=format&fit=crop", "desc": "Adventure capital, Milford Sound, and Lord of the Rings scenery.", "longDesc": "The adventure capital of the world. Go bungee jumping, take a cruise through the majestic Milford Sound, and explore the breathtaking landscapes that filmed 'Lord of the Rings'.", "rating": 5.0, "reviews": 290, "duration": "6 Days", "groupSize": "Max 10", "placesToVisit": ["Milford Sound", "Lake Wakatipu", "Skyline Gondola", "Glenorchy", "The Remarkables"]
      }
    ]
  }
];

// ==========================================
// 3. SEEDING LOGIC
// ==========================================
const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for Seeding...");
        
        // 1. CLEAR OLD DATA
        await Country.deleteMany({});
        await City.deleteMany({});
        await Tour.deleteMany({});
        console.log("Cleaned existing database.");

        let tourCount = 0;

        // 2. ITERATE OVER LEGACY DATA (Continents)
        for (const continentData of legacyData) {
            const continentName = continentData.name;

            for (const countryData of continentData.countries) {
                
                // === STEP A: UPSERT COUNTRY ===
                const cName = countryData.name;
                const intel = countryIntelligence[cName] || { 
                    iso: cName.substring(0, 2).toUpperCase(), 
                    yield: "Medium", 
                    visa: "Visa Required", 
                    currency: "USD",
                    visitors: 1000000
                };

                let country = await Country.findOne({ name: cName });
                if (!country) {
                    country = await Country.create({
                        name: cName,
                        continent: continentName,
                        isoCode: intel.iso,
                        marketYieldTier: intel.yield,
                        annualVisitors: intel.visitors,
                        visaPolicy: intel.visa,
                        currency: intel.currency,
                        backgroundImage: countryData.image // Use tour image as fallback hero
                    });
                }

                // === STEP B: UPSERT CITY ===
                const cityName = countryData.city;
                const cityIntel = cityIntelligence[cityName] || { 
                    lat: 0, 
                    lng: 0, 
                    budget: 150 
                };

                let city = await City.findOne({ name: cityName });
                if (!city) {
                    city = await City.create({
                        name: cityName,
                        countryId: country._id,
                        location: { 
                            type: 'Point', 
                            coordinates: [cityIntel.lng, cityIntel.lat] 
                        },
                        economics: {
                            minDailyBudget: cityIntel.budget,
                            accommodationCost: Math.floor(cityIntel.budget * 0.5),
                            mealIndex: Math.floor(cityIntel.budget * 0.3),
                            transitCost: Math.floor(cityIntel.budget * 0.1),
                            currencyStrength: "Stable"
                        },
                        timeZone: "UTC", // Placeholder
                        popularityIndex: Math.floor(Math.random() * 20) + 80 // Random 80-100 score
                    });
                }

                // === STEP C: CREATE TOUR (PRODUCT) ===
                // Clean Price String ("$999" -> 999)
                const numericPrice = parseInt(countryData.price.replace(/[^0-9]/g, '')) || 999;

                await Tour.create({
                    name: `${cityName} & ${cName} Explorer`, // Generate a Professional Name
                    cityId: city._id,
                    countryId: country._id,
                    
                    price: numericPrice,
                    duration: countryData.duration,
                    groupSize: countryData.groupSize,
                    
                    stats: {
                        rating: countryData.rating,
                        reviewsCount: countryData.reviews,
                        isTrending: countryData.rating > 4.8, // Logic for "Trending"
                        breakdown: {
                            verified: Math.floor(countryData.rating * 20), // 4.8 -> 96
                            volume: 90,
                            nlpSentiment: 95
                        }
                    },

                    images: [countryData.image],
                    overview: countryData.longDesc || countryData.desc,
                    amenities: countryData.placesToVisit // Map old "placesToVisit" to amenities
                });
                
                tourCount++;
            }
        }

        console.log(`Database Successfully Seeded!`);
        console.log(`- Countries Created/Linked`);
        console.log(`- Cities Created/Linked`);
        console.log(`- ${tourCount} Tours Created with Strategic Intelligence.`);
        
        process.exit();

    } catch (error) {
        console.error("Seeding Error:", error);
        process.exit(1);
    }
};

seedDatabase();