import io from "socket.io-client";
import {createSlice} from "@reduxjs/toolkit";

const DEBUG = true;

function log(...args) {
  if (DEBUG) {
    console.log("[Client]", new Date().toISOString(), ...args);
  }
}

function logError(...args) {
  if (DEBUG) {
    console.error("[Client Error]", new Date().toISOString(), ...args);
  }
}

const socket = io("http://localhost:4000/alert", {
  transports: ["websocket", "polling"],
  withCredentials: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
});

export const disasterSlice = createSlice({
  name: "disaster",
  initialState: {
    activeAlerts: [],
    isConnected: false,
    connectionError: null,
  },
  reducers: {
    addAlert: (state, action) => {
      state.activeAlerts.push(action.payload);
    },
    removeAlert: (state, action) => {
      state.activeAlerts = state.activeAlerts.filter(
        (alert) => alert.id !== action.payload
      );
    },
    setConnectionStatus: (state, action) => {
      state.isConnected = action.payload;
      state.connectionError = null;
    },
    setConnectionError: (state, action) => {
      state.connectionError = action.payload;
      state.isConnected = false;
    },
  },
});

export const {addAlert, removeAlert, setConnectionStatus, setConnectionError} =
  disasterSlice.actions;

class DisasterSocketService {
  constructor(store) {
    if (!store) {
      throw new Error("Redux store is required");
    }
    this.store = store;
    this.setupSocketListeners();
    this.watchdogTimer = null;
    this.startWatchdog();
    log("DisasterSocketService initialized");
  }

  startWatchdog() {
    log("Starting connection watchdog");
    this.watchdogTimer = setInterval(() => {
      if (!socket.connected) {
        logError("Socket connection lost, attempting to reconnect...");
        socket.connect();
      }
    }, 5000);
  }

  setupSocketListeners() {
    socket.on("connect", () => {
      log("Socket connected");
      this.store.dispatch(setConnectionStatus(true));
    });

    socket.on("connect_error", (error) => {
      logError("Socket connection error:", error.message);
      this.store.dispatch(setConnectionError(error.message));
    });

    socket.on("disconnect", (reason) => {
      log("Socket disconnected:", reason);
      this.store.dispatch(setConnectionStatus(false));
    });

    socket.on("disasterAlert", (alert) => {
      log("Disaster alert received:", alert);
      this.store.dispatch(
        addAlert({
          ...alert,
          id: Date.now(),
          receivedAt: new Date().toISOString(),
        })
      );
    });

    socket.on("error", (error) => {
      logError("Socket error:", error);
      this.store.dispatch(setConnectionError(error.message));
    });
  }

  startLocationUpdates(userId) {
    if (!userId) {
      logError("Cannot start location updates: No user ID provided");
      return;
    }

    if (!navigator.geolocation) {
      logError("Geolocation is not supported by this browser");
      return;
    }

    log("Starting location updates for user:", userId);

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const locationData = {
          userId,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        log("Sending location update:", locationData);
        socket.emit("updateLocation", locationData);
      },
      (error) => {
        logError("Geolocation error:", error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );

    return watchId;
  }

  sendEmergencyAlert(alertData) {
    if (!socket.connected) {
      logError("Cannot send alert: Socket not connected");
      return false;
    }

    if (
      !alertData ||
      !alertData.latitude ||
      !alertData.longitude ||
      !alertData.radius
    ) {
      logError("Invalid alert data:", alertData);
      return false;
    }

    log("Sending emergency alert:", alertData);
    socket.emit("emergencyAlert", {
      ...alertData,
      timestamp: Date.now(),
    });

    return true;
  }

  cleanup() {
    log("Cleaning up socket service");
    if (this.watchdogTimer) {
      clearInterval(this.watchdogTimer);
    }
    socket.disconnect();
  }
}

export default DisasterSocketService;
