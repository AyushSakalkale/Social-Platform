import express from "express";
import {createServer} from "http";
import {Server} from "socket.io";
import redis from "redis";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

console.log("Socket.io server initialized");

const alertNamespace = io.of("/alert");
console.log("Alert namespace created");

// Redis client for storing user locations
const redisClient = redis.createClient();
console.log("Redis client initialized");

redisClient.on("error", (err) => {
  console.error("Redis Client Error:", err);
  console.error("Error details:", {
    message: err.message,
    code: err.code,
    stack: err.stack,
  });
});

redisClient.on("connect", () => {
  console.log("Redis client connected successfully");
});

await redisClient.connect();

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
    activeUsers: activeUsers.size,
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

      // Store in memory and Redis
      activeUsers.set(socket.id, locationData);
      await redisClient.hSet(
        "user_locations",
        userId,
        JSON.stringify(locationData)
      );

      console.log("Location successfully updated:", {
        userId,
        activeUsers: activeUsers.size,
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
  socket.on(
    "emergencyAlert",
    async ({latitude, longitude, radius, type, message}) => {
      console.log("Emergency alert received:", {
        type,
        latitude,
        longitude,
        radius,
        timestamp: new Date().toISOString(),
      });

      try {
        const affectedUsers = new Set();
        console.log("Current active users:", {
          total: activeUsers.size,
          users: Array.from(activeUsers.keys()),
        });

        // Check active users in memory first
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

        // Broadcast alert to affected users
        affectedUsers.forEach((socketId) => {
          console.log("Sending alert to socket:", socketId);
          alertNamespace.to(socketId).emit("disasterAlert", {
            type,
            message,
            latitude,
            longitude,
            radius,
          });
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
    }
  );

  // Handle disconnection
  socket.on("disconnect", async () => {
    console.log("User disconnecting:", {
      socketId: socket.id,
      timestamp: new Date().toISOString(),
    });

    try {
      const userData = activeUsers.get(socket.id);
      if (userData) {
        await redisClient.hDel("user_locations", userData.userId);
        activeUsers.delete(socket.id);
        console.log("User cleanup completed:", {
          userId: userData.userId,
          socketId: socket.id,
          remainingUsers: activeUsers.size,
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

// Start server
const PORT = process.env.SOCKET_PORT || 4000;
httpServer.listen(PORT, () => {
  console.log("Server status:", {
    port: PORT,
    time: new Date().toISOString(),
    namespace: "/alert",
    activeConnections: activeUsers.size,
  });
});
