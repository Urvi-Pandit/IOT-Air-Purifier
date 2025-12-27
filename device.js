const mqtt = require("mqtt");

const MQTT_BROKER_URL = "mqtt://localhost:1883";

const DEVICE_ID = "airpurifier-001";

const TELEMETRY_TOPIC = `devices/${DEVICE_ID}/telemetry`;
const COMMAND_TOPIC = `devices/${DEVICE_ID}/command`;

let state = {
  power: true,
  fanSpeed: 2, // 0=off, 1=low, 2=medium, 3=high
  sensors: {
    networkStrength: 75,
    temperature: 26,
    humidity: 50,
    pm1: 12,
    pm25: 35,
    pm10: 48,
    sound: 30,
    voc: 40,
  },
};

function gradualChange(prev) {
  const delta = Math.floor(Math.random() * 5) - 2; 
  let next = prev + delta;
  if (next < 1) next = 1;
  if (next > 100) next = 100;
  return next;
}

const client = mqtt.connect(MQTT_BROKER_URL);

client.on("connect", () => {
  console.log(`[MQTT] Connected to broker at ${MQTT_BROKER_URL}`);

  // Subscribe to command topic
  client.subscribe(COMMAND_TOPIC, (err) => {
    if (err) {
      console.error(`[MQTT] Subscription error: ${err.message}`);
    } else {
      console.log(`[MQTT] Subscribed to command topic: ${COMMAND_TOPIC}`);
    }
  });

  // Start publishing telemetry immediately and every 2 minutes
  publishTelemetry();
  setInterval(publishTelemetry, 2 * 60 * 1000);
});

client.on("error", (err) => {
  console.error(`[MQTT] Connection error: ${err.message}`);
});

client.on("message", (topic, message) => {
  if (topic === COMMAND_TOPIC) {
    handleCommand(message.toString());
  }
});

function handleCommand(msg) {
  try {
    const cmd = JSON.parse(msg);
    console.log(`[COMMAND RECEIVED]`, cmd);

    if (typeof cmd.fanSpeed === "number") {
      if (cmd.fanSpeed >= 0 && cmd.fanSpeed <= 5) {
        state.fanSpeed = cmd.fanSpeed;
        state.power =
          typeof cmd.power === "boolean" ? cmd.power : cmd.fanSpeed > 0;

        console.log(
          `[STATE UPDATED] Fan speed: ${state.fanSpeed}, Power: ${state.power}`
        );
      } else {
        console.warn(`[COMMAND WARNING] Invalid fanSpeed: ${cmd.fanSpeed}`);
      }
      return;
    }

    console.warn(`[COMMAND WARNING] Unknown command format`);
  } catch (err) {
    console.error(`[COMMAND ERROR] Failed to parse command: ${err.message}`);
  }
}

function publishTelemetry() {
  // Update sensor values
  for (const key in state.sensors) {
    state.sensors[key] = gradualChange(state.sensors[key]);
  }

  if (!state.power) {
    state.sensors.sound = 1;
    state.sensors.voc = 1;
  }

  const payload = {
    deviceId: DEVICE_ID,
    timestamp: new Date().toISOString(),
    networkStrength: state.sensors.networkStrength,
    temperature: state.sensors.temperature,
    humidity: state.sensors.humidity,
    pm1: state.sensors.pm1,
    pm25: state.sensors.pm25,
    pm10: state.sensors.pm10,
    sound: state.sensors.sound,
    voc: state.sensors.voc,
    fanSpeed: state.fanSpeed,
    power: state.power,
  };

  const payloadStr = JSON.stringify(payload);

  client.publish(TELEMETRY_TOPIC, payloadStr, { qos: 1 }, (err) => {
    if (err) {
      console.error(`[MQTT] Publish error: ${err.message}`);
    } else {
      console.log(`[TELEMETRY PUBLISHED] ${payloadStr}`);
    }
  });
}
