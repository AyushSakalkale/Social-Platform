// src/components/emergency/EmergencyTweetForm.js
import {useState} from "react";
import {io} from "socket.io-client";

const socket = io("http://localhost:4000/alert");

const EmergencyTweetForm = ({userId, onClose}) => {
  const [message, setMessage] = useState("");
  const [photos, setPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Get current location
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      // Create emergency tweet
      socket.emit("emergencyTweet", {
        userId,
        message,
        photos,
        location,
      });

      setMessage("");
      setPhotos([]);
      onClose();
    } catch (error) {
      console.error("Error creating emergency tweet:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    // Convert files to base64 strings
    Promise.all(
      files.map((file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      })
    ).then((base64Photos) => {
      setPhotos(base64Photos);
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4 text-red-600">
          Emergency Alert
        </h2>
        <form onSubmit={handleSubmit}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What's the emergency? Please provide details..."
            className="w-full p-2 border rounded mb-4 h-32"
            required
          />

          <input
            type="file"
            onChange={handlePhotoChange}
            multiple
            accept="image/*"
            className="mb-4"
          />

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 text-white rounded"
            >
              {isLoading ? "Sending..." : "Send Emergency Alert"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmergencyTweetForm;
