const mongoose = require("mongoose");

const ScheduleSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    required: true,
  },
  startTime: { type: String, required: true }, // Format: "HH:mm"
  endTime: { type: String, required: true },   
  fanSpeed: { type: Number, required: true, min: 1, max: 5 },
});

module.exports = mongoose.model("Schedule", ScheduleSchema);
