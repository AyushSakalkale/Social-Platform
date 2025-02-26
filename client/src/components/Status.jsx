import React, {useEffect, useState} from "react";
import {useSelector} from "react-redux";

const DisasterStatus = () => {
  const isConnected = useSelector((state) => state.disaster.isConnected);
  const activeAlerts = useSelector((state) => state.disaster.activeAlerts);
  const [locationStatus, setLocationStatus] = useState("Checking...");

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus("❌ Not Supported");
      return;
    }

    navigator.permissions.query({name: "geolocation"}).then((result) => {
      if (result.state === "granted") {
        setLocationStatus("✅Enabled");
      } else if (result.state === "denied") {
        setLocationStatus("❌ Permission Denied");
      } else {
        setLocationStatus("⚠️ Permission Needed");
      }
    });
  }, []);

  return (
    <div className="p-4 bg-gray-200 rounded-md shadow-md w-72 text-black">
      <h3 className="text-lg font-semibold mb-2">📊 Disaster Service Status</h3>

      {/* Connection Status */}
      <p
        className={`mb-2 px-3 py-1 rounded ${
          isConnected ? "bg-green-300" : "bg-red-300"
        }`}
      >
        {isConnected ? "✅ Connected" : "❌ Disconnected"}
      </p>

      {/* Active Alerts Count */}
      <p className="mb-2 px-3 py-1 bg-yellow-200 rounded">
        🚨 Active Alerts: {activeAlerts.length}
      </p>

      {/* Location Tracking Status */}
      <p className="px-3 py-1 bg-blue-200 rounded">
        📍 Location Tracking: {locationStatus}
      </p>
    </div>
  );
};

export default DisasterStatus;
