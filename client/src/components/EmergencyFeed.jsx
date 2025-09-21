// src/components/emergency/EmergencyFeed.js
import {useState, useEffect} from "react";
import {useSelector} from "react-redux";
import { alertSocket as socket } from "../config/socketConfig";
import EmergencyTweet from "./EmergencyTweet";
import EmergencyTweetForm from "./EmergencyTweetForm";
import LocationTracker from "./LocationTracker";

const EmergencyFeed = () => {
  const userId = useSelector((state) => state?.user?._id);
  const [emergencyTweets, setEmergencyTweets] = useState([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    socket.on("connect", () => {
      console.log("Connected to emergency alert server", socket.id);
    });

    socket.on("user-connected-server", () => {
      console.log("User connected to server", socket.id);
    });

    // Listen for new emergency tweets
    socket.on("newEmergencyTweet", (tweet) => {
      setEmergencyTweets((prev) => [tweet, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <button>{userId}</button>
      <LocationTracker userId={userId} />
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-4 right-4 bg-red-600 text-white p-4 rounded-full shadow-lg"
      >
        Emergency Alert
      </button>

      {showForm && (
        <EmergencyTweetForm
          userId={userId}
          onClose={() => setShowForm(false)}
        />
      )}

      <div className="space-y-4">
        {emergencyTweets.map((tweet, index) => (
          <EmergencyTweet key={index} tweet={tweet} />
        ))}
      </div>
    </div>
  );
};

export default EmergencyFeed;
