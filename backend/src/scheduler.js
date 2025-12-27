const Schedule = require("./models/Schedule");
const mqttClient = require("./mqttClient");

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const retryLimits = 3;
const retryDelays = 30000; // 30 seconds

const retries = {};

function getCurrentTimeString() {
  const now = new Date();
  return now.toTimeString().slice(0, 5);
}

async function checkSchedules() {
  const now = new Date();
  const day = dayNames[now.getDay()];
  const currentTime = getCurrentTimeString();

  const schedules = await Schedule.find({ day });

  schedules.forEach(async (schedule) => {
    if (schedule.startTime === currentTime) {
      sendCommand(schedule, "start");
    } else if (schedule.endTime === currentTime) {
      sendCommand(schedule, "end");
    }
  });
}

function sendCommand(schedule, type) {
  const topic = "devices/airpurifier-001/command"; 

  const command =
    type === "start"
      ? { fanSpeed: schedule.fanSpeed }
      : { power: false };

  mqttClient.client.publish(topic, JSON.stringify(command), (err) => {
    if (err) {
      console.error(`Failed to send ${type} command, scheduling retry`);
      retryCommand(schedule, type);
    } else {
      console.log(`${type} command sent successfully`);
      clearRetries(schedule, type);
    }
  });
}

function retryCommand(schedule, type) {
  const key = `${schedule._id}-${type}`;
  retries[key] = (retries[key] || 0) + 1;

  if (retries[key] <= retryLimits) {
    setTimeout(() => sendCommand(schedule, type), retryDelays);
  } else {
    console.error(`Giving up retrying ${type} command for schedule ${schedule._id}`);
    clearRetries(schedule, type);
  }
}

function clearRetries(schedule, type) {
  const key = `${schedule._id}-${type}`;
  delete retries[key];
}

function startScheduler() {
  setInterval(checkSchedules, 60 * 1000); // Every minute
}

module.exports = { startScheduler };
