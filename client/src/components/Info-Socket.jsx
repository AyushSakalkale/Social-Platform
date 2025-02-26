const DisasterInstructions = () => {
  return (
    <div className="p-6 bg-white shadow-lg rounded-lg max-w-md mx-auto border border-gray-300">
      <h2 className="text-xl font-bold mb-4 text-center">
        📌 How to Use the Disaster Alert System
      </h2>

      <ul className="space-y-3 text-gray-700">
        <li>
          1️⃣ <strong>Check Connection Status</strong> → If{" "}
          <span className="text-green-600 font-bold">✅ Connected</span>, the
          system is ready.
        </li>
        <li>
          2️⃣ <strong>View Active Alerts</strong> → Any received disaster alerts
          will be displayed.
        </li>
        <li>
          3️⃣ <strong>Send an Emergency Alert</strong> → Enter a message and
          click <span className="text-red-600 font-bold">🚨 Send Alert</span>.
        </li>
        <li>
          4️⃣ <strong>Enable Location Tracking</strong> → Click{" "}
          <span className="text-blue-600 font-bold">
            📍 Start Location Tracking
          </span>{" "}
          (allow GPS).
        </li>
        <li>
          5️⃣ <strong>Monitor Real-Time Updates</strong> → Alerts and status
          change automatically.
        </li>
      </ul>

      <p className="mt-4 text-center font-semibold">
        That’s it! Stay informed and alert. 🚀
      </p>
    </div>
  );
};

export default DisasterInstructions;
