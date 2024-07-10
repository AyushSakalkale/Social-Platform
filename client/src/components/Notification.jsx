import {Link} from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner.jsx";
import {IoSettingsOutline} from "react-icons/io5";
import {FaUser, FaHeart} from "react-icons/fa6";
import {useDispatch, useSelector} from "react-redux";
import {useEffect} from "react";
import {
  deleteNotifications,
  fetchNotifications,
} from "../redux/notificationSlice.jsx";
import toast from "react-hot-toast";

const NotificationPage = () => {
  const notifications = useSelector(
    (state) => state.notification.notifications
  );
  const status = useSelector((state) => state.notification.status);
  const error = useSelector((state) => state.notification.error);
  const dispatch = useDispatch();

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchNotifications());
    }
  }, [status, dispatch]);

  const handleDeleteNotifications = () => {
    dispatch(deleteNotifications())
      .unwrap()
      .then(() => {
        toast.success("Notifications deleted successfully");
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };

  return (
    <>
      <div className="flex-[4_4_0] border-l border-r border-gray-700 min-h-screen">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <p className="font-bold">Notifications</p>
          {/* <div className="dropdown   "> */}
          <div
            className={`dropdown ${notifications.length === 0 ? "hidden" : ""}`}
          >
            <div tabIndex={0} role="button" className="m-1">
              <IoSettingsOutline className="w-4" />
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li>
                <a onClick={handleDeleteNotifications}>
                  Delete all notifications
                </a>
              </li>
            </ul>
          </div>
        </div>
        {status === "loading" && (
          <div className="flex justify-center h-full items-center">
            <LoadingSpinner size="lg" />
          </div>
        )}
        {status === "failed" && (
          <div className="text-center p-4 font-bold">Error: {error}</div>
        )}
        {status === "succeeded" && notifications?.length === 0 && (
          <div className="text-center p-4 font-bold">No notifications 🤔</div>
        )}
        {status === "succeeded" &&
          notifications?.map((notification) => (
            <div className="border-b border-gray-700" key={notification._id}>
              <div className="flex gap-2 p-4">
                {notification.type === "follow" && (
                  <FaUser className="w-7 h-7 text-primary" />
                )}
                {notification.type === "like" && (
                  <FaHeart className="w-7 h-7 text-red-500" />
                )}
                <Link to={`/profile/${notification.from._id}`}>
                  <div className="avatar">
                    <div className="w-8 rounded-full">
                      <img
                        src={
                          notification.from.profileImg ||
                          "/avatar-placeholder.png"
                        }
                      />
                    </div>
                    <span className="font-bold pl-3">
                      {" 📣 "}@{notification.from.username}
                    </span>
                  </div>
                  <div className="flex gap-1">{notification.content}</div>
                </Link>
              </div>
            </div>
          ))}
      </div>
    </>
  );
};

export default NotificationPage;
