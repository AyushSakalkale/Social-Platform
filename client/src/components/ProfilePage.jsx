import {useRef, useState, useEffect} from "react";
import {Link, useParams} from "react-router-dom";
import Posts from "./Posts";
import ProfileHeaderSkeleton from "./ProfileHeaderSkeleton.jsx";
import EditProfileModal from "./EditProfileModal.jsx";
import {FaArrowLeft} from "react-icons/fa6";
import {IoCalendarOutline} from "react-icons/io5";
import {FaLink} from "react-icons/fa";
import {MdEdit} from "react-icons/md";
import {useSelector, useDispatch} from "react-redux";
import useGetMyTweets from "../hooks/useGetMyTweets.jsx";
import {followingUpdate, getMyProfile} from "../redux/userSlice";
import axios from "axios";
import {timeSince, USER_API_END_POINT} from "../utils/constant.js";
import toast from "react-hot-toast";
import {getRefresh} from "../redux/tweetSlice.jsx";

const ProfilePage = () => {
  const {user} = useSelector((store) => store.user);
  const {refresh} = useSelector((store) => store.tweet);
  const {refreshUser} = useSelector((store) => store.user);
  const {id} = useParams();
  const dispatch = useDispatch();

  const isMyProfile = !id || id === user?._id;
  console.log(isMyProfile);

  useEffect(() => {
    const fetchProfile = async () => {
      const profileId = isMyProfile ? user?._id : id;
      if (profileId) {
        try {
          const res = await axios.get(
            `${USER_API_END_POINT}/profile/${profileId}`,
            {
              withCredentials: true,
            }
          );
          dispatch(getMyProfile(res.data.user));
        } catch (error) {
          console.log(error);
        }
      }
    };

    fetchProfile();
  }, [id, isMyProfile, user?._id, dispatch, refresh, refreshUser]);

  const {profile} = useSelector((store) => store.user);
  const profileId = isMyProfile ? user?._id : id;
  useGetMyTweets(profileId);

  const {particulartweets} = useSelector((store) => store.tweet);

  const [coverImg, setCoverImg] = useState(null);
  const [coverImgFile, setCoverImgFile] = useState(null);
  const [profileImg, setProfileImg] = useState(null);
  const [profileImgFile, setProfileImgFile] = useState(null);
  const [feedType, setFeedType] = useState("particular");

  const coverImgRef = useRef(null);
  const profileImgRef = useRef(null);

  const isLoading = false;

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImgFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setProfileImg(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImgFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setCoverImg(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (coverImgFile) {
        const formData = new FormData();
        formData.append("coverImg", coverImgFile);
        const response = await axios.put(
          `${USER_API_END_POINT}/updatecoverimg`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            withCredentials: true,
          }
        );
        dispatch(getRefresh());
        if (response.data.success) {
          toast.success(response.data.message);
          setCoverImg(null);
          setCoverImgFile(null);
          coverImgRef.current.value = null;
        }
      }
      if (profileImgFile) {
        const formData = new FormData();
        formData.append("profileImg", profileImgFile);
        const response = await axios.put(
          `${USER_API_END_POINT}/updateavatar`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            withCredentials: true,
          }
        );
        dispatch(getRefresh());
        if (response.data.success) {
          toast.success(response.data.message);
          setProfileImg(null);
          setProfileImgFile(null);
          profileImgRef.current.value = null;
        }
      }
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    }
  };

  const followAndUnfollowHandler = async (id) => {
    if (user.following.includes(id)) {
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
      try {
        axios.defaults.withCredentials = true;
        const res = await axios.post(`${USER_API_END_POINT}/follow/${id}`, {
          id: user?._id,
        });
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
    <div className="flex-[4_4_0] border-r border-gray-700 min-h-screen">
      {isLoading && <ProfileHeaderSkeleton />}
      {!isLoading && !user && (
        <p className="text-center text-lg mt-4">User not found</p>
      )}
      <div className="flex flex-col">
        {!isLoading && user && (
          <>
            <div className="flex gap-10 px-4 py-2 items-center">
              <Link to="/">
                <FaArrowLeft className="w-4 h-4" />
              </Link>
              <div className="flex flex-col">
                <p className="font-bold text-lg">{profile?.fullName}</p>
                <span className="text-sm text-slate-500">
                  {particulartweets?.length} posts
                </span>
              </div>
            </div>
            <div className="relative group/cover">
              <img
                src={profile?.coverImg}
                className="h-52 w-full object-cover"
                alt="cover image"
              />
              {isMyProfile && (
                <div
                  className="absolute top-2 right-2 rounded-full p-2 bg-gray-800 bg-opacity-75 cursor-pointer opacity-0 group-hover/cover:opacity-100 transition duration-200"
                  onClick={() => coverImgRef.current.click()}
                >
                  <MdEdit className="w-5 h-5 text-white" />
                </div>
              )}
              <input
                type="file"
                hidden
                ref={coverImgRef}
                onChange={handleCoverChange}
              />
              <input
                type="file"
                hidden
                ref={profileImgRef}
                onChange={handleAvatarChange}
              />
              <div className="avatar absolute -bottom-16 left-4">
                <div className="w-32 rounded-full relative group/avatar">
                  <img src={profile?.profileImg} alt="Profile" />
                  <div className="absolute top-5 right-3 p-1 bg-primary rounded-full group-hover/avatar:opacity-100 opacity-0 cursor-pointer">
                    {isMyProfile && (
                      <MdEdit
                        className="w-4 h-4 text-white"
                        onClick={() => profileImgRef.current.click()}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end px-4 mt-5">
              {isMyProfile && <EditProfileModal />}
              {!isMyProfile && (
                <button
                  className="btn btn-outline rounded-full btn-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    followAndUnfollowHandler(profileId);
                  }}
                >
                  {user.following.includes(profileId) ? "Following" : "Follow"}
                </button>
              )}
              {(coverImg || profileImg) && (
                <button
                  className="btn btn-primary rounded-full btn-sm text-white px-4 ml-2"
                  onClick={handleSubmit}
                >
                  Update
                </button>
              )}
            </div>
            <div className="flex flex-col gap-4 mt-14 px-4">
              <div className="flex flex-col">
                <span className="font-bold text-lg">{profile?.fullName}</span>
                <span className="text-sm text-slate-500">
                  @{profile?.username}
                </span>
                <span className="text-sm my-1">{profile?.bio}</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {profile?.link && (
                  <div className="flex gap-1 items-center">
                    <>
                      <FaLink className="w-3 h-3 text-slate-500" />
                      <a
                        href={profile?.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-blue-500 hover:underline"
                      >
                        {profile?.link}
                      </a>
                    </>
                  </div>
                )}
                <div className="flex gap-2 items-center">
                  <IoCalendarOutline className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-500">
                    Joined {timeSince(profile?.createdAt)}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex gap-1 items-center">
                  <span className="font-bold text-xs">
                    {profile?.following.length}
                  </span>
                  <span className="text-slate-500 text-xs">Following</span>
                </div>
                <div className="flex gap-1 items-center">
                  <span className="font-bold text-xs">
                    {profile?.followers.length}
                  </span>
                  <span className="text-slate-500 text-xs">Followers</span>
                </div>
              </div>
            </div>
            <div className="flex w-full border-b border-gray-700 mt-4">
              <div
                className="flex justify-center flex-1 p-3 hover:bg-secondary transition duration-300 relative cursor-pointer"
                onClick={() => setFeedType("particular")}
              >
                Posts
                {feedType === "particular" && (
                  <div className="absolute bottom-0 w-10 h-1 rounded-full bg-primary" />
                )}
              </div>
              <div
                className="flex justify-center flex-1 p-3 text-slate-500 hover:bg-secondary transition duration-300 relative cursor-pointer"
                onClick={() => setFeedType("likes")}
              >
                Likes
                {feedType === "likes" && (
                  <div className="absolute bottom-0 w-10 h-1 rounded-full bg-primary" />
                )}
              </div>
            </div>
          </>
        )}
        <Posts type={feedType} />
      </div>
    </div>
  );
};

export default ProfilePage;
