# IoT Air Purifier Backend

This project implements an IoT backend system for a simulated air purifier device.  
It uses MQTT for real-time device communication, MongoDB for persistence, and Node.js
with Express for backend APIs.

The system supports telemetry ingestion, device state management, scheduling,
and a temporary pre-clean override feature.

---

## Architecture

The system follows an event-driven IoT architecture:

Device Simulator → MQTT Broker → Backend Service → MongoDB  
Backend Service → MQTT Broker → Device Simulator

**Flow:**
- The device simulator publishes telemetry data periodically via MQTT.
- The backend subscribes to telemetry topics, processes messages, and stores data in MongoDB.
- REST APIs allow triggering schedules and pre-clean actions.
- Commands are sent back to the device via MQTT command topics.

---

## Components

### Device Simulator (`device.js`)
- Simulates an air purifier device.
- Publishes telemetry data (PM levels, temperature, humidity, fan speed, power).
- Listens for MQTT commands to update device state.

### Backend Service (Node.js + Express)
- Subscribes to MQTT telemetry topics.
- Stores sensor data and device state in MongoDB.
- Exposes REST APIs for scheduling and pre-clean control.
- Sends commands to devices via MQTT.

### MQTT Broker (Mosquitto)
- Handles lightweight publish/subscribe messaging between devices and backend.

### Database (MongoDB Atlas)
- Stores sensor telemetry data.
- Maintains current device state.
- Persists schedules.

---

## APIs

### Scheduling API
`POST /api/schedules`  
Creates a recurring schedule to control the device fan speed.

### Pre-Clean API
`POST /api/preclean`  
Temporarily overrides the fan speed for a specified duration and restores the previous state.

---

## Trade-offs

- MQTT was chosen over HTTP polling for efficient real-time communication.
- MongoDB was selected for schema flexibility instead of a relational database.
- A script-based device simulator is used instead of real hardware for simplicity.
- Authentication, authorization, and production-grade security are intentionally omitted to keep the scope focused on core IoT functionality.

---

## Assumptions

- A single device (`airpurifier-001`) is active in the system.
- The MQTT broker runs locally on port `1883`.
- MongoDB Atlas credentials are provided via environment variables.
- Network failures and device disconnections are not handled in this version.

---

## How to Run

```bash
# Start MQTT broker
mosquitto

# Start backend
node app.js

# Start device simulator
node device.js
