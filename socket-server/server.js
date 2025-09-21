import express from "express";
import {createServer} from "http";
import {Server} from "socket.io";
import redis from "redis";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

// Enable CORS
app.use(cors({
  origin: ["http://localhost", "http://localhost:80", "http://localhost:5173"],
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}));

const httpServer = createServer(app);

// Socket.io setup with proper CORS
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost", "http://localhost:80", "http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
  },
  path: "/socket.io/",
  transports: ["websocket", "polling"],
  pingTimeout: 60000,
  pingInterval: 25000,
  upgradeTimeout: 10000,
  allowUpgrades: true,
  cookie: false
});

console.log("Socket.io server initialized");

const alertNamespace = io.of("/alert");
console.log("Alert namespace created");

// Initialize Redis client
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

// Initialize Redis subscriber for pub/sub
const redisSubscriber = redis.createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));
redisClient.on("connect", () => console.log("Redis Client Connected"));

redisSubscriber.on("error", (err) => console.error("Redis Subscriber Error", err));
redisSubscriber.on("connect", () => console.log("Redis Subscriber Connected"));

// Connect to Redis
(async () => {
  await redisClient.connect();
  await redisSubscriber.connect();
  console.log("Redis connections established");

  // Subscribe to socket events channel
  await redisSubscriber.subscribe("socket-events", (message) => {
    try {
      const event = JSON.parse(message);
      // Broadcast the event to all connected clients in this pod
      alertNamespace.emit(event.type, event.data);
    } catch (error) {
      console.error("Error processing Redis message:", error);
    }
  });
})();

// Function to update user location in Redis
async function updateUserLocation(userId, locationData) {
  try {
    // Add timestamp to prevent duplicate updates
    const data = {
      ...locationData,
      lastUpdate: Date.now()
    };
    await redisClient.hSet("user_locations", userId, JSON.stringify(data));
    console.log("Location updated in Redis:", {
      userId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating location in Redis:", error);
  }
}

// Function to get all active users from Redis
async function getAllActiveUsers() {
  try {
    const users = await redisClient.hGetAll("user_locations");
    const now = Date.now();
    const activeUsers = [];
    
    for (const [userId, data] of Object.entries(users)) {
      const userData = JSON.parse(data);
      // Only include users with recent updates (within last 30 seconds)
      if (now - userData.lastUpdate < 30000) {
        activeUsers.push({
          userId,
          ...userData
        });
      }
    }
    
    return activeUsers;
  } catch (error) {
    console.error("Error getting active users from Redis:", error);
    return [];
  }
}

// Function to remove user from Redis
async function removeUserFromRedis(userId) {
  try {
    await redisClient.hDel("user_locations", userId);
    console.log("User removed from Redis:", {
      userId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error removing user from Redis:", error);
  }
}

// Function to store alert in Redis to prevent duplicates
async function storeAlert(alertData) {
  try {
    const alertId = `${alertData.type}-${alertData.latitude}-${alertData.longitude}-${Date.now()}`;
    await redisClient.hSet("recent_alerts", alertId, JSON.stringify(alertData));
    // Set expiration for 5 minutes
    await redisClient.expire("recent_alerts", 300);
    return alertId;
  } catch (error) {
    console.error("Error storing alert in Redis:", error);
    return null;
  }
}

// Function to check if alert is a duplicate
async function isDuplicateAlert(alertData) {
  try {
    const recentAlerts = await redisClient.hGetAll("recent_alerts");
    for (const [_, data] of Object.entries(recentAlerts)) {
      const existingAlert = JSON.parse(data);
      if (
        existingAlert.type === alertData.type &&
        existingAlert.latitude === alertData.latitude &&
        existingAlert.longitude === alertData.longitude &&
        Date.now() - existingAlert.timestamp < 30000 // Within last 30 seconds
      ) {
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error("Error checking duplicate alert:", error);
    return false;
  }
}

// Health check endpoint
app.get("/health", (req, res) => {
  const health = {
    status: "healthy",
    redis: redisClient ? "connected" : "disconnected",
    socket: io ? "initialized" : "not initialized"
  };
  res.status(200).json(health);
});

// Store active connections and their locations
const activeUsers = new Map();

// Calculate distance between two points (in kilometers)
function calculateDistance(lat1, lon1, lat2, lon2) {
  console.log("Calculating distance between points:", {
    point1: {lat: lat1, lon: lon1},
    point2: {lat: lat2, lon: lon2},
  });

  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  console.log("Calculated distance:", distance, "km");
  return distance;
}

// Initialize Socket.io connection
alertNamespace.on("connection", (socket) => {
  console.log("New user connected:", {
    socketId: socket.id,
    timestamp: new Date().toISOString(),
  });

  // Handle user location updates
  socket.on("updateLocation", async ({userId, latitude, longitude}) => {
    console.log("Location update received:", {
      userId,
      socketId: socket.id,
      latitude,
      longitude,
      timestamp: new Date().toISOString(),
    });

    try {
      const locationData = {
        userId,
        latitude,
        longitude,
        socketId: socket.id,
        timestamp: Date.now(),
      };

      // Store in Redis
      await updateUserLocation(userId, locationData);

      // Publish location update to all pods
      await redisClient.publish("socket-events", JSON.stringify({
        type: "locationUpdate",
        data: locationData
      }));

      console.log("Location successfully updated:", {
        userId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error updating location:", {
        error: error.message,
        stack: error.stack,
        userId,
        socketId: socket.id,
      });
    }
  });

  // Handle emergency alerts
  socket.on("emergencyAlert", async ({latitude, longitude, radius, type, message}) => {
    console.log("Emergency alert received:", {
      type,
      latitude,
      longitude,
      radius,
      timestamp: new Date().toISOString(),
    });

    try {
      const alertData = {
        type,
        message,
        latitude,
        longitude,
        radius,
        timestamp: Date.now(),
      };

      // Check for duplicate alert
      if (await isDuplicateAlert(alertData)) {
        console.log("Duplicate alert detected, ignoring:", alertData);
        return;
      }

      // Store alert in Redis
      const alertId = await storeAlert(alertData);
      if (!alertId) {
        throw new Error("Failed to store alert");
      }

      const affectedUsers = new Set();
      
      // Get all active users from Redis
      const activeUsers = await getAllActiveUsers();
      console.log("Current active users from Redis:", {
        total: activeUsers.length,
        users: activeUsers.map(u => u.userId),
      });

      // Check active users from Redis
      activeUsers.forEach((userData) => {
        console.log("Checking user for alert eligibility:", {
          userId: userData.userId,
          userLocation: {
            lat: userData.latitude,
            lon: userData.longitude,
          },
        });

        const distance = calculateDistance(
          latitude,
          longitude,
          userData.latitude,
          userData.longitude
        );

        console.log("Distance calculation result:", {
          userId: userData.userId,
          distance,
          isAffected: distance <= radius,
        });

        if (distance <= radius) {
          affectedUsers.add(userData.socketId);
        }
      });

      console.log("Affected users identified:", {
        total: affectedUsers.size,
        sockets: Array.from(affectedUsers),
      });

      // Broadcast alert to affected users only
      const broadcastData = {
        ...alertData,
        alertId,
        affectedUsers: affectedUsers.size
      };

      // Publish alert to all pods
      await redisClient.publish("socket-events", JSON.stringify({
        type: "disasterAlert",
        data: broadcastData
      }));

      // Send to affected users in this pod
      affectedUsers.forEach(socketId => {
        alertNamespace.to(socketId).emit("disasterAlert", broadcastData);
      });

      console.log("Alert broadcast completed:", {
        affectedUsers: affectedUsers.size,
        type,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error broadcasting alert:", {
        error: error.message,
        stack: error.stack,
        type,
        affectedUsers: affectedUsers?.size || 0,
      });
    }
  });

  // Handle disconnection
  socket.on("disconnect", async () => {
    console.log("User disconnecting:", {
      socketId: socket.id,
      timestamp: new Date().toISOString(),
    });

    try {
      // Get all active users from Redis
      const activeUsers = await getAllActiveUsers();
      const userData = activeUsers.find(user => user.socketId === socket.id);
      
      if (userData) {
        await removeUserFromRedis(userData.userId);
        // Publish disconnect event to all pods
        await redisClient.publish("socket-events", JSON.stringify({
          type: "userDisconnect",
          data: { userId: userData.userId, socketId: socket.id }
        }));
        console.log("User cleanup completed:", {
          userId: userData.userId,
          socketId: socket.id,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Error handling disconnect:", {
        error: error.message,
        stack: error.stack,
        socketId: socket.id,
      });
    }
  });
});

// Start server with proper host binding
const PORT = process.env.SOCKET_PORT || 4000;
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log("Server status:", {
    port: PORT,
    time: new Date().toISOString(),
    namespace: "/alert",
    activeConnections: activeUsers.size,
  });
});
