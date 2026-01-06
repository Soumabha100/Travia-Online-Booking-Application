const express = require("express");
const router = express.Router();
const Country = require("../models/Country");
const City = require("../models/City");
const Tour = require("../models/Tour");

// ==========================================
// 1. PUBLIC COUNTRIES API (OPTIMIZED FOR PAGINATION)
// ==========================================
router.get("/countries", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";

    // Build Search Query
    let query = {};
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const countries = await Country.find(query)
      .sort({ annualVisitors: -1 }) // Most popular first
      .skip(skip)
      .limit(limit);

    res.json(countries);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch countries" });
  }
});

// TO Fetch a Single Country by ID
router.get("/countries/:id", async (req, res) => {
  try {
    const country = await Country.findById(req.params.id);
    if (!country) return res.status(404).json({ error: "Country not found" });
    res.json(country);
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
});

// ==========================================
// 2. PUBLIC CITIES API (OPTIMIZED FOR PAGINATION LIMIT 12)
// ==========================================
router.get("/cities", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";

    let query = {};
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const cities = await City.find(query)
      .populate("countryId", "name")
      .sort({ popularityIndex: -1 })
      .skip(skip)
      .limit(limit);

    res.json(cities);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch cities" });
  }
});

// ==========================================
// 3. PUBLIC TOURS API (For Cards)
// ==========================================
router.get("/tours", async (req, res) => {
  try {
    // 1. Get Query Params (Defaults: Page 1, Limit 10)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const search = req.query.search || ""; // Optional Server-Side Search
    const countryId = req.query.country; // <--- ADD THIS
    const cityId = req.query.city; // <--- ADD THIS

    // 2. Build Query Object
    let query = {};

    // A. Text Search 
    if (search) {
      // Simple regex search on name (For advanced search, we'd use Atlas Search)
      query.name = { $regex: search, $options: "i" };
    }

    // B. Filter by Country ID (This fixes the "All Tours" bug)
    if (countryId) {
      query.countryId = countryId;
    }

    // C. Filter by City ID (For Cities Page)
    if (cityId) {
      query.cityId = cityId;
    }

    // 3. Fetch Data with Pagination
    const tours = await Tour.find(query)
      .populate("cityId", "name")
      .populate("countryId", "name")
      .sort({ createdAt: -1 }) // Newest first
      .skip(skip)
      .limit(limit);

    // 4. Get Total Count (For frontend logic)
    const total = await Tour.countDocuments(query);

    res.json({
      data: tours,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tours" });
  }
});

// 4. GET Single Tour by ID (To Getch one single Tour by ID in Tour Details Page)
router.get("/tours/:id", async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id)
      .populate("cityId", "name")
      .populate("countryId", "name"); // Populate names, not just IDs

    if (!tour) return res.status(404).json({ error: "Tour not found" });

    res.json(tour);
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;
