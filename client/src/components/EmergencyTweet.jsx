// src/components/emergency/EmergencyTweet.js
const EmergencyTweet = ({tweet}) => {
  return (
    <div className="border rounded-lg p-4 mb-4 bg-red-50">
      <div className="flex items-center mb-2">
        <span className="bg-red-600 text-white px-2 py-1 rounded text-sm mr-2">
          EMERGENCY
        </span>
        <span className="text-gray-500">
          {new Date(tweet.timestamp).toLocaleString()}
        </span>
      </div>

      <p className="mb-4">{tweet.message}</p>

      {tweet.photos?.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          {tweet.photos.map((photo, index) => (
            <img
              key={index}
              src={photo}
              alt={`Emergency photo ${index + 1}`}
              className="rounded"
            />
          ))}
        </div>
      )}

      <div className="text-sm text-gray-500">
        Location: {tweet.location.latitude}, {tweet.location.longitude}
      </div>
    </div>
  );
};

export default EmergencyTweet;
