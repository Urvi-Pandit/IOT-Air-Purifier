const express = require("express");
const Schedule = require("../models/Schedule");

const router = express.Router();

// Create a new schedule
router.post("/", async (req, res) => {
  try {
    const { day, startTime, endTime, fanSpeed } = req.body;

    // Basic validation
    if (!day || !startTime || !endTime || !fanSpeed) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const schedule = new Schedule({ day, startTime, endTime, fanSpeed });
    await schedule.save();

    // TODO: Add scheduling logic to send MQTT commands at startTime and endTime

    res.status(201).json(schedule);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all schedules
router.get("/", async (req, res) => {
  try {
    const schedules = await Schedule.find();
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
