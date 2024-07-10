import Notification from "../models/notificationSchema.js";

export const getNotifications = async (req, res) => {
  try {
    const loggedInUserId = req.user;

    const notifications = await Notification.find({
      to: loggedInUserId,
    }).populate({
      path: "from",
      select: "username profileImg ",
    });

    await Notification.updateMany({to: loggedInUserId}, {read: true});
    res.status(200).json({data: notifications});
  } catch (error) {
    console.log("Error in getNotifications function", error.message);
    res.status(500).json({error: "Internal Server Error"});
  }
};

export const deleteNotifications = async (req, res) => {
  try {
    const loggedInUserId = req.user;
    await Notification.deleteMany({to: loggedInUserId});
    res.status(200).json({message: "Notifications deleted successfully"});
  } catch (error) {
    console.log("Error in deleteNotifications function", error.message);
    res.status(500).json({error: "Internal Server Error"});
  }
};
