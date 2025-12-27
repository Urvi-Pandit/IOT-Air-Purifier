# IoT Air Purifier Backend

This project implements an IoT backend system with a simulated air purifier device.  
It uses MQTT for real-time communication, MongoDB for persistence, and Node.js for backend services.

---

## Architecture Overview

Device Simulator → MQTT Broker → Backend Service → MongoDB  
Backend Service → MQTT Broker → Device Simulator

---

## Components

- **Device Simulator (`device.js`)**  
  Simulates an air purifier device by publishing telemetry and listening to MQTT commands.

- **Backend Service (Node.js + Express)**  
  Consumes MQTT telemetry, stores data, and exposes APIs to control devices.

- **MQTT Broker (Mosquitto)**  
  Handles device-to-backend communication.

- **Database (MongoDB)**  
  Stores sensor data, device state, and schedules.

---

## APIs

### Scheduling API
`POST /api/schedules`  
Creates a recurring schedule to control fan speed.

### Pre-Clean API
`POST /api/preclean`  
Triggers a temporary fan speed override.

---

## How to Run

```bash
# Start MQTT broker
mosquitto

# Start backend
node app.js

# Start device simulator
node device.js
