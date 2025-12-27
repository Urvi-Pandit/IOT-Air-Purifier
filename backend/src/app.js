require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const mqttClient = require("./mqttClient");

const app = express();

// Use PORT and MONGO_URI from env, fallback for PORT
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

app.use(cors());
app.use(bodyParser.json());

const scheduleRoutes = require("./routes/schedule");
const preCleanRoutes = require("./routes/preclean");

function startServer() {
  app.use("/api/schedules", scheduleRoutes);
  app.use("/api/preclean", preCleanRoutes);

  app.get("/", (req, res) => {
    res.send("IoT Air Purifier Backend Running");
  });

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    return mqttClient.connect();
  })
  .then(() => {
    console.log("MQTT client connected");

    const scheduler = require("./scheduler");
    scheduler.startScheduler();

    startServer();
  })
  .catch((err) => {
    console.error("Error during startup:", err);
    process.exit(1);
  });
