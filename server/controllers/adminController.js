const User = require("../models/User");
const Country = require("../models/Country");
const City = require("../models/City");
const Tour = require("../models/Tour");
const Booking = require("../models/Booking");

// --- DASHBOARD STATS ---
const getDashboardStats = async (req, res) => {
  try {
    const stats = {
      users: await User.countDocuments(),
      bookings: await Booking.countDocuments(),
      tours: await Tour.countDocuments(),
      cities: await City.countDocuments(),
      countries: await Country.countDocuments()
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- GENERIC CRUD HELPERS ---
const createHandler = (Model) => async (req, res) => {
    try {
        const doc = new Model(req.body);
        await doc.save();
        res.status(201).json(doc);
    } catch (err) { res.status(400).json({ message: err.message }); }
};

const getAllHandler = (Model, populateOpts = []) => async (req, res) => {
    try {
        let query = Model.find();
        populateOpts.forEach(opt => query = query.populate(opt));
        const docs = await query.exec();
        res.json(docs);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

const updateHandler = (Model) => async (req, res) => {
    try {
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(doc);
    } catch (err) { res.status(400).json({ message: err.message }); }
};

const deleteHandler = (Model) => async (req, res) => {
    try {
        await Model.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted successfully" });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// --- USERS ---
const getAllUsers = async (req, res) => {
  const users = await User.find({}).select("-password");
  res.json(users);
};

// --- EXPORTS ---
module.exports = {
  getDashboardStats,
  getAllUsers,
  
  // Countries
  getCountries: getAllHandler(Country),
  createCountry: createHandler(Country),
  updateCountry: updateHandler(Country),
  deleteCountry: deleteHandler(Country),

  // Cities
  getCities: getAllHandler(City, ['countryId']),
  createCity: createHandler(City),
  updateCity: updateHandler(City),
  deleteCity: deleteHandler(City),

  // Tours
  getTours: getAllHandler(Tour, ['countryId', 'cityId']),
  createTour: createHandler(Tour),
  updateTour: updateHandler(Tour),
  deleteTour: deleteHandler(Tour)
};