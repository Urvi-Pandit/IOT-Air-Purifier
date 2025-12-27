const mqtt = require("mqtt");
const SensorData = require("./models/SensorData");
const DeviceState = require("./models/DeviceState");

const MQTT_BROKER_URL = "mqtt://localhost:1883";
const TELEMETRY_TOPIC = "devices/+/telemetry";

let client;

function connect() {
  return new Promise((resolve, reject) => {
    client = mqtt.connect(MQTT_BROKER_URL);

    client.on("connect", () => {
      console.log(`[MQTT] Connected to broker at ${MQTT_BROKER_URL}`);

      client.subscribe(TELEMETRY_TOPIC, (err) => {
        if (err) {
          console.error(`[MQTT] Subscription error: ${err.message}`);
          reject(err);
        } else {
          console.log(`[MQTT] Subscribed to telemetry topic: ${TELEMETRY_TOPIC}`);
          resolve(client);
        }
      });
    });

    client.on("error", (err) => {
      console.error(`[MQTT] Connection error: ${err.message}`);
      reject(err);
    });

    client.on("message", async (topic, message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log(`[MQTT] Message received on ${topic}`, data);

        await SensorData.create(data);
        await DeviceState.findOneAndUpdate(
          { deviceId: data.deviceId },
          {
            fanSpeed: data.fanSpeed,
            power: data.power,
            updatedAt: new Date(),
          },
          { upsert: true, new: true }
        );
      } catch (err) {
        console.error("[MQTT] Failed to process message:", err.message);
      }
    });
  });
}

function getClient() {
  if (!client) {
    throw new Error("MQTT client not connected yet");
  }
  return client;
}

module.exports = { connect, getClient };
