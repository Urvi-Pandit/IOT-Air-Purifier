const mongoose = require("mongoose");

const SensorDataSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  timestamp: { type: Date, required: true },
  networkStrength: Number,
  temperature: Number,
  humidity: Number,
  pm1: Number,
  pm25: Number,
  pm10: Number,
  sound: Number,
  voc: Number,
  fanSpeed: Number,
  power: Boolean,
});

module.exports = mongoose.model("SensorData", SensorDataSchema);
