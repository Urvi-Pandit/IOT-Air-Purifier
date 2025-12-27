const mongoose = require("mongoose");

const DeviceStateSchema = new mongoose.Schema({
  deviceId: { type: String, required: true, unique: true },
  power: Boolean,
  fanSpeed: Number,
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("DeviceState", DeviceStateSchema);
