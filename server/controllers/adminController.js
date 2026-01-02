const User = require("../models/User");
const Destination = require("../models/Destination");
const Booking = require("../models/Booking");

// @desc    Get Dashboard Stats
// @route   GET /api/admin/stats
const getDashboardStats = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const bookingCount = await Booking.countDocuments();

    // Count total individual packages (countries) across all Destination regions
    const destinations = await Destination.find();
    let packageCount = 0;
    destinations.forEach((dest) => {
      packageCount += dest.countries.length;
    });

    res.json({
      users: userCount,
      bookings: bookingCount,
      packages: packageCount,
      regions: destinations.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get All Users
// @route   GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password"); // Exclude passwords
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a New Region (e.g., "Europe")
// @route   POST /api/admin/region
const addRegion = async (req, res) => {
  const { name } = req.body;
  try {
    const newDest = new Destination({ name, countries: [] });
    const createdDest = await newDest.save();
    res.status(201).json(createdDest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Add Package to Region
// @route   POST /api/admin/package
const addPackage = async (req, res) => {
  const { regionId, packageData } = req.body;
  try {
    const destination = await Destination.findById(regionId);
    if (!destination) {
      return res.status(404).json({ message: "Region not found" });
    }

    destination.countries.push(packageData);
    await destination.save();
    res.status(201).json({ message: "Package added successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a Package
// @route   DELETE /api/admin/package/:regionId/:packageId
const deletePackage = async (req, res) => {
    try {
        const { regionId, packageId } = req.params;
        
        const destination = await Destination.findById(regionId);
        if (!destination) return res.status(404).json({ message: "Region not found" });

        // Filter out the package to delete
        destination.countries = destination.countries.filter(
            (pkg) => pkg._id.toString() !== packageId
        );

        await destination.save();
        res.json({ message: "Package removed successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a Package
// @route   PUT /api/admin/package/:regionId/:packageId
const updatePackage = async (req, res) => {
    try {
        const { regionId, packageId } = req.params;
        const updatedData = req.body; // Expects the full package object

        const destination = await Destination.findById(regionId);
        if (!destination) return res.status(404).json({ message: "Region not found" });

        // Find index of the package
        const index = destination.countries.findIndex(
            (pkg) => pkg._id.toString() === packageId
        );

        if (index === -1) return res.status(404).json({ message: "Package not found" });

        // Update the specific fields
        destination.countries[index] = { ...destination.countries[index], ...updatedData };
        
        await destination.save();
        res.json({ message: "Package updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


module.exports = { getDashboardStats, getAllUsers, addRegion, addPackage, deletePackage, updatePackage };
