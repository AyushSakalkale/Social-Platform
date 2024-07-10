import {Link, useParams} from "react-router-dom";
import RightPanelSkeleton from "./RightPanelSkeleton";
import {useSelector, useDispatch} from "react-redux";
import toast from "react-hot-toast";
import axios from "axios";
import {USER_API_END_POINT} from "../utils/constant";
import {followingUpdate} from "../redux/userSlice";
import {getRefresh} from "../redux/tweetSlice";

const RightSidebar = () => {
  const dispatch = useDispatch();
  const isLoading = false;
  const {user, otherUsers} = useSelector((store) => store.user);
  const loggedInuser = user;
  const followAndUnfollowHandler = async (id) => {
    if (user.following?.includes(id)) {
      // unfollow
      try {
        axios.defaults.withCredentials = true;
        const res = await axios.post(`${USER_API_END_POINT}/unfollow/${id}`, {
          id: user?._id,
        });
        dispatch(followingUpdate(id));
        dispatch(getRefresh());
        toast.success(res.data.message);
      } catch (error) {
        toast.error(error.response.data.message);
        console.log(error);
      }
    } else {
      // follow
      try {
        axios.defaults.withCredentials = true;
        const res = await axios.post(`${USER_API_END_POINT}/follow/${id}`, {
          id: user?._id,
        });
        // console.log(res);
        dispatch(followingUpdate(id));
        dispatch(getRefresh());
        toast.success(res.data.message);
      } catch (error) {
        toast.error(error.response.data.message);
        console.log(error);
      }
    }
  };

  return (
    <div className="hidden lg:block my-4 mx-2">
      <div className="bg-[#16181C] p-4 rounded-md sticky top-2">
        <p className="font-bold">Who to follow</p>
        <div className="flex flex-col gap-4">
          {/* item */}
          {isLoading && (
            <>
              <RightPanelSkeleton />
              <RightPanelSkeleton />
              <RightPanelSkeleton />
              <RightPanelSkeleton />
            </>
          )}
          {!isLoading &&
            otherUsers?.map((user) => (
              <Link
                to={`/profile/${user._id}`}
                className="flex items-center justify-between gap-4"
                key={user._id}
              >
                <div className="flex gap-2 items-center">
                  <div className="avatar">
                    <div className="w-8 rounded-full">
                      <img src={user.profileImg || "/avatar-placeholder.png"} />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold tracking-tight truncate w-28">
                      {user.fullName}
                    </span>
                    <span className="text-sm text-slate-500">
                      @{user.username}
                    </span>
                  </div>
                </div>
                <div>
                  <button
                    className="btn bg-white text-black hover:bg-white hover:opacity-90 rounded-full btn-sm"
                    onClick={(e) => {
                      e.preventDefault();
                      followAndUnfollowHandler(user?._id);
                    }}
                  >
                    {loggedInuser.following?.includes(user?._id)
                      ? "Following"
                      : "Follow"}
                  </button>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
};
export default RightSidebar;
