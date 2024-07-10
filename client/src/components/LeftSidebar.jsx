import XSvg from "./X.jsx";
import {MdHomeFilled} from "react-icons/md";
import {IoNotifications} from "react-icons/io5";
import {FaUser} from "react-icons/fa";
import {Link, useNavigate} from "react-router-dom";
import {BiLogOut} from "react-icons/bi";
import {useDispatch, useSelector} from "react-redux";
import {USER_API_END_POINT} from "../utils/constant.js";
import axios from "axios";
import {getMyProfile, getOtherUsers, getUser} from "../redux/userSlice.jsx";
import toast from "react-hot-toast";
import {useEffect} from "react";
import {
  clearParticularTweets,
  getAllTweets,
  getexploreTweets,
  getParticularTweets,
} from "../redux/tweetSlice.jsx";
import {getNotification} from "../redux/notificationSlice.jsx";

const LeftSidebar = () => {
  const user = useSelector((state) => state?.user?.user);

  const navigate = useNavigate();
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, []);

  const {fullName, username, profileImg} = user || {};

  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      const res = await axios.get(`${USER_API_END_POINT}/logout`);
      dispatch(getUser(null));
      dispatch(getOtherUsers(null));
      dispatch(getMyProfile(null));
      dispatch(getAllTweets(null));
      dispatch(getParticularTweets(null));
      dispatch(getexploreTweets(null));
      dispatch(getNotification([]));
      navigate("/login");
      toast.success(res.data.message);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    // <div className="md:flex-[2_2_0] w-18 max-w-52">
    //   <div className="sticky top-0 left-0 h-screen flex flex-col border-r border-gray-700 w-20 md:w-full">
    //     <Link to="/" className="flex justify-center md:justify-start">
    //       <XSvg className="px-2 w-12 h-12 rounded-full fill-white hover:bg-stone-900" />
    //     </Link>
    //     <ul className="flex flex-col gap-3 mt-4">
    //       <li className="flex justify-center md:justify-start">
    //         <Link
    //           to="/"
    //           className="flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer"
    //         >
    //           <MdHomeFilled className="w-8 h-8" />
    //           <span className="text-lg hidden md:block">Home</span>
    //         </Link>
    //       </li>
    //       <li className="flex justify-center md:justify-start">
    //         <Link
    //           to="/notifications"
    //           className="flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer"
    //         >
    //           <IoNotifications className="w-6 h-6" />
    //           <span className="text-lg hidden md:block">Notifications</span>
    //         </Link>
    //       </li>
    //       <li className="flex justify-center md:justify-start">
    //         <Link
    //           to={`/profile`}
    //           className="flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer"
    //         >
    //           <FaUser className="w-6 h-6" />
    //           <span className="text-lg hidden md:block">Profile</span>
    //         </Link>
    //       </li>
    //     </ul>
    //     {
    //       <button
    //         onClick={handleLogout}
    //         className="mt-auto mb-10 flex gap-2 items-start transition-all duration-300 hover:bg-[#181818] py-2 px-4 rounded-full"
    //       >
    //         <div className="avatar hidden md:inline-flex">
    //           <div className="w-8 rounded-full">
    //             <img
    //               src={profileImg || "/avatar-placeholder.png"}
    //               alt="Profile"
    //             />
    //           </div>
    //         </div>
    //         <div className="flex justify-between flex-1">
    //           <div className="hidden md:block">
    //             <p className="text-white font-bold text-sm w-20 truncate">
    //               {fullName}
    //             </p>
    //             <p className="text-slate-500 text-sm">@{username}</p>
    //           </div>
    //           <BiLogOut className="w-5 h-5 cursor-pointer" />
    //         </div>
    //       </button>
    //     }
    //   </div>
    // </div>
    <div className="md:flex-[2_2_0] w-18 max-w-52">
      <div className="sticky top-0 left-0 h-screen flex flex-col border-r border-gray-700 w-20 md:w-full">
        <Link to="/" className="flex justify-center md:justify-start">
          <XSvg className="px-2 w-12 h-12 rounded-full fill-white hover:bg-stone-900" />
        </Link>
        <ul className="flex flex-col gap-3 mt-4">
          <li className="flex justify-center md:justify-start">
            <Link
              to="/"
              className="flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer"
            >
              <MdHomeFilled className="w-8 h-8" />
              <span className="text-lg hidden md:block">Home</span>
            </Link>
          </li>
          <li className="flex justify-center md:justify-start">
            <Link
              to="/notifications"
              className="flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer"
            >
              <IoNotifications className="w-6 h-6" />
              <span className="text-lg hidden md:block">Notifications</span>
            </Link>
          </li>
          <li className="flex justify-center md:justify-start">
            <Link
              to={`/profile`}
              className="flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer"
            >
              <FaUser className="w-6 h-6" />
              <span className="text-lg hidden md:block">Profile</span>
            </Link>
          </li>
        </ul>
        <button
          onClick={handleLogout}
          className="mt-auto mb-10 flex gap-2 items-start transition-all duration-300 hover:bg-[#181818] py-2 px-4 rounded-full"
        >
          <div className="avatar hidden md:inline-flex">
            <div className="w-8 rounded-full">
              <img
                src={profileImg || "/avatar-placeholder.png"}
                alt="Profile"
              />
            </div>
          </div>
          <div className="flex justify-between flex-1">
            <div className="hidden md:block">
              <p className="text-white font-bold text-sm w-20 truncate">
                {fullName}
              </p>
              <p className="text-slate-500 text-sm">@{username}</p>
            </div>
            <BiLogOut className="w-5 h-5 cursor-pointer" />
          </div>
        </button>
      </div>
    </div>
  );
};
export default LeftSidebar;
