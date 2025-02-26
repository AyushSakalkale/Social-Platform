// src/components/emergency/LocationTracker.js
import {useEffect} from "react";
import {io} from "socket.io-client";

const socket = io("http://localhost:4000");

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

            // Send location update to socket server
            socket.emit("updateLocation", {userId, location});
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
