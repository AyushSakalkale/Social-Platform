// import {useSelector, useDispatch} from "react-redux";
// import {removeAlert} from "../redux/disasterSlice.jsx";
// import {AlertTriangle, X} from "lucide-react";

// const DisasterAlert = () => {
//   const {activeAlerts} = useSelector((state) => state.disaster);
//   console.log("These are the active alerts " + activeAlerts);
//   const dispatch = useDispatch();

//   if (activeAlerts.size === 0) return <div>NO alerts</div>;

//   return (
//     <div className="fixed bottom-4 right-4 z-50 space-y-2">
//       {activeAlerts.map((alert) => (
//         <div
//           key={alert.id}
//           className="bg-red-600 text-white p-4 rounded-lg shadow-lg max-w-md animate-slide-in"
//         >
//           <div className="flex items-start justify-between">
//             <AlertTriangle className="h-5 w-5 mr-2" />
//             <div className="flex-1">
//               <h3 className="font-bold">{alert.type}</h3>
//               <p className="text-sm">{alert.message}</p>
//               <p className="text-xs mt-1">
//                 Distance: {alert.distance?.toFixed(1)}km away
//               </p>
//             </div>
//             <button
//               onClick={() => dispatch(removeAlert(alert.id))}
//               className="text-white hover:text-gray-200"
//             >
//               <X className="h-4 w-4" />
//             </button>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default DisasterAlert;

import {useSelector, useDispatch} from "react-redux";
import {removeAlert} from "../redux/disasterSlice.jsx";
import {AlertTriangle, X} from "lucide-react";

const DisasterAlert = () => {
  const {activeAlerts} = useSelector((state) => state.disaster);
  const dispatch = useDispatch();

  if (activeAlerts.size === 0)
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Active Alerts</h2>
        <div className="text-center text-gray-500 py-8">No active alerts</div>
      </div>
    );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Active Alerts</h2>
      <div className="space-y-4">
        {Array.from(activeAlerts).map((alert) => (
          <div
            key={alert.id}
            className="bg-gradient-to-r from-red-600 to-red-500 text-white p-4 rounded-lg shadow-md animate-pulse"
          >
            <div className="flex items-start justify-between">
              <AlertTriangle className="h-6 w-6 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-bold text-lg">{alert.type}</h3>
                <p className="text-sm mt-1">{alert.message}</p>
                <p className="text-xs mt-2 font-semibold">
                  Distance: {alert.distance?.toFixed(1)}km away
                </p>
              </div>
              <button
                onClick={() => dispatch(removeAlert(alert.id))}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DisasterAlert;
