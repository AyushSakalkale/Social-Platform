// import {useEffect, useState} from "react";
// import DisasterSocketService from "../redux/disasterSlice.jsx";
// import store from "../redux/store.jsx";
// import {AlertTriangle, Send} from "lucide-react";

// const EmergencyReport = () => {
//   const [socketService, setSocketService] = useState(null);
//   useEffect(() => {
//     const service = new DisasterSocketService(store);
//     setSocketService(service);
//   }, []);

//   const [formData, setFormData] = useState({
//     type: "FLOOD",
//     message: "",
//     radius: 5,
//   });

//   const [isLoading, setIsLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);

//     if (!socketService) {
//       console.error("❌ Socket service not initialized yet.");
//       return;
//     }
//     try {
//       const pos = await new Promise((resolve, reject) => {
//         navigator.geolocation.getCurrentPosition(resolve, reject);
//       });

//       const alertData = {
//         ...formData,
//         latitude: pos.coords.latitude,
//         longitude: pos.coords.longitude,
//       };

//       console.log("🚀 Sending alert:", alertData);
//       socketService.sendEmergencyAlert(alertData);
//       setFormData({...formData, message: ""});
//     } catch (error) {
//       console.error("Error sending alert:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="bg-white rounded-lg shadow-lg p-6">
//       <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
//         <AlertTriangle className="mr-2 text-red-600" />
//         Report Emergency
//       </h2>
//       <form onSubmit={handleSubmit} className="space-y-6">
//         <div>
//           <label className="block text-sm font-medium mb-2 text-gray-700">
//             Emergency Type
//           </label>
//           <select
//             value={formData.type}
//             onChange={(e) => setFormData({...formData, type: e.target.value})}
//             className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-800 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
//           >
//             <option value="FLOOD">Flood</option>
//             <option value="FIRE">Fire</option>
//             <option value="EARTHQUAKE">Earthquake</option>
//             <option value="STORM">Storm</option>
//             <option value="OTHER">Other</option>
//           </select>
//         </div>

//         <div>
//           <label className="block text-sm font-medium mb-2 text-gray-700">
//             Description
//           </label>
//           <textarea
//             value={formData.message}
//             onChange={(e) =>
//               setFormData({...formData, message: e.target.value})
//             }
//             className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-800 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
//             rows="4"
//             required
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium mb-2 text-gray-700">
//             Alert Radius (km)
//           </label>
//           <input
//             type="number"
//             value={formData.radius}
//             onChange={(e) =>
//               setFormData({...formData, radius: Number(e.target.value)})
//             }
//             className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-800 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
//             min="1"
//             max="50"
//           />
//         </div>

//         <button
//           type="submit"
//           disabled={isLoading}
//           className="w-full bg-gradient-to-r from-red-600 to-red-500 text-white py-3 px-4 rounded-md hover:from-red-700 hover:to-red-600 disabled:opacity-50 transition-all flex items-center justify-center"
//         >
//           {isLoading ? (
//             "Sending..."
//           ) : (
//             <>
//               <Send className="mr-2 h-5 w-5" />
//               Send Alert
//             </>
//           )}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default EmergencyReport;

import {useEffect, useState} from "react";
import DisasterSocketService from "../redux/disasterSlice.jsx";
import store from "../redux/store.jsx";
import {AlertTriangle, Send} from "lucide-react";

const EmergencyReport = () => {
  const [socketService, setSocketService] = useState(null);
  const [userLocation, setUserLocation] = useState(null); // ✅ Store location in state
  const [formData, setFormData] = useState({
    type: "FLOOD",
    message: "",
    radius: 5,
  });
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Initialize socket globally (prevent re-initialization on every render)
  useEffect(() => {
    const service = new DisasterSocketService(store);
    setSocketService(service);
  }, []);

  // ✅ Pre-fetch location when component mounts
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (error) => {
        console.error("❌ Failed to fetch location:", error);
      }
    );
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!socketService) {
      console.error("❌ Socket service not initialized yet.");
      return;
    }

    if (!userLocation) {
      console.error("❌ Location not available.");
      return;
    }

    const alertData = {
      ...formData,
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
    };

    console.log("🚀 Sending alert:", alertData);
    socketService.sendEmergencyAlert(alertData);
    setFormData({...formData, message: ""});
    setIsLoading(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
        <AlertTriangle className="mr-2 text-red-600" />
        Report Emergency
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Emergency Type
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({...formData, type: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-800"
          >
            <option value="FLOOD">Flood</option>
            <option value="FIRE">Fire</option>
            <option value="EARTHQUAKE">Earthquake</option>
            <option value="STORM">Storm</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Description
          </label>
          <textarea
            value={formData.message}
            onChange={(e) =>
              setFormData({...formData, message: e.target.value})
            }
            className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-800"
            rows="4"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !userLocation}
          className="w-full bg-gradient-to-r from-red-600 to-red-500 text-white py-3 px-4 rounded-md disabled:opacity-50 flex items-center justify-center"
        >
          {isLoading ? (
            "Sending..."
          ) : (
            <>
              <Send className="mr-2 h-5 w-5" /> Send Alert
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default EmergencyReport;
