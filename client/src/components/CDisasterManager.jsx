// import DisasterAlert from "./CDisasterAlert";
// import EmergencyReport from "./CEmergencyReport";
// import LocationTracker from "./CLocationTracker";

// const DisasterManager = () => {
//   return (
//     <>
//       <LocationTracker />
//       <DisasterAlert />
//       <EmergencyReport />
//     </>
//   );
// };

// export default DisasterManager;

import DisasterAlert from "./CDisasterAlert";
import EmergencyReport from "./CEmergencyReport";
import LocationTracker from "./CLocationTracker";
import DisasterStatus from "./Status";
import DisasterInstructions from "./Info-Socket.jsx";

const DisasterManager = () => {
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 "
      style={{width: "100%"}}
    >
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold text-red-600 text-center">
            🚨 Emergency Response Center 🚨
          </h1>
        </div>
      </header>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Emergency Report
              </h2>
              <EmergencyReport />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Disaster Alerts
            </h2>
            <DisasterAlert />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Disaster Status
            </h2>
            <DisasterStatus />
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Safety Instructions
            </h2>
            <DisasterInstructions />
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4">
        <LocationTracker />
      </div>
    </div>
  );
};

export default DisasterManager;
