const express = require("express");
const DeviceState = require("../models/DeviceState");
const mqttClient = require("../mqttClient");

const router = express.Router();

let preCleanTimeout = null;
let previousState = null;

router.post("/", async (req, res) => {
  try {
    const { fanSpeed, duration } = req.body;

    if (
      typeof fanSpeed !== "number" ||
      fanSpeed < 1 ||
      fanSpeed > 5 ||
      typeof duration !== "number" ||
      duration <= 0
    ) {
      return res.status(400).json({ message: "Invalid fanSpeed or duration" });
    }

    const device = await DeviceState.findOne({ deviceId: "airpurifier-001" });

    if (!device) {
      return res.status(404).json({ message: "Device state not found" });
    }

    if (preCleanTimeout) {
      clearTimeout(preCleanTimeout);
      if (previousState) {
        await sendCommand(previousState);
      }
    }

    previousState = {
      fanSpeed: device.fanSpeed,
      power: device.power,
    };

    await sendCommand({ fanSpeed, power: true });

    preCleanTimeout = setTimeout(async () => {
      await sendCommand(previousState);
      previousState = null;
      preCleanTimeout = null;
      console.log("[PreClean] Restored previous fan state");
    }, duration * 1000);

    res.json({ message: "Pre-clean mode activated", fanSpeed, duration });
  } catch (err) {
    console.error("[PreClean] Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

async function sendCommand({ fanSpeed, power }) {
  const topic = "devices/airpurifier-001/command";
  const command = { fanSpeed, power };

  try {
    const client = mqttClient.getClient();
    await new Promise((resolve, reject) => {
      client.publish(topic, JSON.stringify(command), (err) => {
        if (err) {
          reject(err);
        } else {
          console.log("[PreClean] Command sent:", command);
          resolve();
        }
      });
    });
  } catch (err) {
    console.error("[PreClean] Failed to send command:", err.message);
  }
}

module.exports = router;
