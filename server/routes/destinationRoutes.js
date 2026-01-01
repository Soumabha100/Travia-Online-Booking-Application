const express = require("express");
const router = express.Router();
const Destination = require("../models/Destination");

router.get("/", async (req, res) => {
  try {
    const getAllDestinations = await Destination.find();

    if (!getAllDestinations || getAllDestinations.length === 0) {
      console.log("⚠️ Database is Empty!");
      return res.status(404).json({ message: "No Data is Found!" });
    }
    res.json(getAllDestinations);
  } catch (error) {
    console.error("❌ API Error!", error);
        res.status(500).json({ message: "Server Error!"});
  }
});

module.exports = router;
