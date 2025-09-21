// src/components/emergency/LocationTracker.js
import {useEffect} from "react";
import { socket } from "../config/socketConfig";

const LocationTracker = ({userId}) => {
  useEffect(() => {
    const trackLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };

            if (socket.connected) {
              // Send location update to socket server
              socket.emit("updateLocation", {userId, ...location});
            } else {
              console.warn("Socket not connected, location update skipped");
            }
          },
          (error) => {
            console.error("Error getting location:", error);
          }
        );
      }
    };

    // Track location immediately and then every minute
    trackLocation();
    const intervalId = setInterval(trackLocation, 4000);

    return () => clearInterval(intervalId);
  }, [userId]);

  return null; // This component doesn't render anything
};

export default LocationTracker;
