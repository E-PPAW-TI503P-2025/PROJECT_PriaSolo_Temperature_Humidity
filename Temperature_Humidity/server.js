const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { PrismaClient } = require("@prisma/client");
const path = require("path");
require("dotenv").config();

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname)); // Serve static files (Frontend)

// Routes

// 1. POST /api/v1/temperature
// Body: { temperature: number, humidity: number, device_name: string }
app.post("/api/v1/temperature", async (req, res) => {
  try {
    const { temperature, humidity, device_name } = req.body;

    if (temperature === undefined) {
      return res.status(400).json({ error: "Temperature is required" });
    }

    let deviceId = null;

    // If device_name is provided, upsert the device
    if (device_name) {
      const device = await prisma.device.upsert({
        where: { name: device_name },
        update: {
          status: "online",
          lastSeen: new Date(),
        },
        create: {
          name: device_name,
          status: "online",
          lastSeen: new Date(),
        },
      });
      deviceId = device.id;
    }

    // Create Reading
    const reading = await prisma.reading.create({
      data: {
        temperature: parseFloat(temperature),
        humidity: humidity ? parseFloat(humidity) : null,
        deviceId: deviceId,
      },
    });

    res.status(201).json({ message: "Data saved successfully", data: reading });
  } catch (error) {
    console.error("Error saving temperature:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 2. GET /api/v1/temperature/latest
// Query: ?device_name=string (optional)
app.get("/api/v1/temperature/latest", async (req, res) => {
  try {
    const { device_name } = req.query;
    let where = {};

    if (device_name) {
      const device = await prisma.device.findUnique({
        where: { name: device_name },
      });
      if (device) {
        where.deviceId = device.id;
      } else {
        return res.status(404).json({ error: "Device not found" });
      }
    }

    const latest = await prisma.reading.findFirst({
      where: where,
      orderBy: { timestamp: "desc" },
      include: { device: true },
    });

    if (!latest) {
      return res.status(404).json({ message: "No data found" });
    }

    res.json(latest);
  } catch (error) {
    console.error("Error fetching latest temperature:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 3. GET /api/v1/temperature/history
// Query: ?limit=10&device_name=string
app.get("/api/v1/temperature/history", async (req, res) => {
  try {
    const { limit = 50, device_name } = req.query;
    let where = {};

    if (device_name) {
      const device = await prisma.device.findUnique({
        where: { name: device_name },
      });
      if (device) {
        where.deviceId = device.id;
      } else {
        // If device not found, return empty or error? Let's return empty list
        return res.json([]);
      }
    }

    const history = await prisma.reading.findMany({
      where: where,
      orderBy: { timestamp: "desc" },
      take: parseInt(limit),
      include: { device: true },
    });

    res.json(history);
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 4. GET /api/v1/devices
// Returns list of devices with computed status based on lastSeen
app.get("/api/v1/devices", async (req, res) => {
  try {
    const devices = await prisma.device.findMany({
      orderBy: { lastSeen: "desc" },
    });

    // Compute online/offline status dynamically (e.g., threshold 5 minutes)
    const now = new Date();
    const THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

    const devicesWithStatus = devices.map((device) => {
      const isOnline = now - new Date(device.lastSeen) < THRESHOLD_MS;
      return {
        ...device,
        status: isOnline ? "online" : "offline", // Override database status with dynamic status
      };
    });

    res.json(devicesWithStatus);
  } catch (error) {
    console.error("Error fetching devices:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
