import React, {useState, useEffect} from "react";
import io from "socket.io-client";

const socket = io("http://localhost:4000/alert");

const UrgentHelp = () => {
  const [helpRequest, setHelpRequest] = useState({
    title: "",
    description: "",
    severity: "high",
    location: "",
  });

  const [helpRequests, setHelpRequests] = useState([]);

  useEffect(() => {
    socket.on("new-help-request", (request) => {
      setHelpRequests((prev) => [...prev, request]);
    });

    return () => {
      socket.off("new-help-request");
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const requestData = {...helpRequest, timestamp: new Date().toISOString()};
    socket.emit("urgent-help", requestData);
    setHelpRequest({
      title: "",
      description: "",
      severity: "high",
      location: "",
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow-lg">
      <h2 className="text-2xl font-bold">Urgent Help Request</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={helpRequest.title}
          onChange={(e) =>
            setHelpRequest({...helpRequest, title: e.target.value})
          }
          placeholder="Title"
          className="border p-2 w-full"
        />
        <textarea
          value={helpRequest.description}
          onChange={(e) =>
            setHelpRequest({...helpRequest, description: e.target.value})
          }
          placeholder="Describe the emergency"
          className="border p-2 w-full"
        />
        <input
          type="text"
          value={helpRequest.location}
          onChange={(e) =>
            setHelpRequest({...helpRequest, location: e.target.value})
          }
          placeholder="Location"
          className="border p-2 w-full"
        />
        <button type="submit" className="bg-red-500 text-white p-2 w-full">
          Send Help Request
        </button>
      </form>

      {/* Active Requests Feed */}
      <div className="mt-6">
        <h3 className="text-xl font-bold">Active Help Requests</h3>
        <ul className="space-y-2">
          {helpRequests.map((req, index) => (
            <li key={index} className="p-3 bg-gray-100 rounded">
              <strong>{req.title}</strong> - {req.description} ({req.location})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UrgentHelp;
