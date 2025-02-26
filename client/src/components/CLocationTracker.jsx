import React, {useEffect, useRef} from "react";
import {useSelector} from "react-redux";
import DisasterSocketService from "../redux/disasterSlice.jsx";
import store from "../redux/store";

const DEBUG = true;

function log(...args) {
  if (DEBUG) {
    console.log("[LocationTracker]", new Date().toISOString(), ...args);
  }
}

function logError(...args) {
  if (DEBUG) {
    console.error("[LocationTracker Error]", new Date().toISOString(), ...args);
  }
}

const LocationTracker = () => {
  const userId = useSelector((state) => state?.user?.user?._id);
  const isConnected = useSelector((state) => state.disaster.isConnected);
  const socketService = useRef(null);
  const watchId = useRef(null);

  useEffect(() => {
    log("LocationTracker mounted");

    if (!userId) {
      logError("No user ID available");
      return;
    }

    log("Connection status:", isConnected);

    if (isConnected && !watchId.current) {
      log("Starting location tracking for user:", userId);
      if (!socketService.current) {
        socketService.current = new DisasterSocketService(store);
      }
      watchId.current = socketService.current.startLocationUpdates(userId);
    }

    return () => {
      if (watchId.current) {
        log("Cleaning up location tracking");
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
      if (socketService.current) {
        socketService.current.cleanup();
        socketService.current = null;
      }
    };
  }, [userId, isConnected]);

  return null;
};

export default LocationTracker;
