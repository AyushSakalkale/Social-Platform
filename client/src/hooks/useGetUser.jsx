// import {useEffect} from "react";
// import {useDispatch, useSelector} from "react-redux";
// import axios from "axios";
// import {USER_API_END_POINT} from "../utils/constant";
// import {getUser, updateUser} from "../redux/userSlice";
// import {getRefresh} from "../redux/tweetSlice";

// const useGetUserData = () => {
//   const dispatch = useDispatch();
//   const refresh = useSelector((state) => state.tweet.refresh);
//   const toggleRefresh = useSelector((state) => state.user.refreshUser);
//   const fetchUserData = async () => {
//     try {
//       const userResponse = await axios.get(`${USER_API_END_POINT}/profile`, {
//         withCredentials: true,
//       });
//       dispatch(updateUser(userResponse.data));
//     } catch (error) {
//       console.error("Error fetching user data:", error);
//     }
//   };

//   useEffect(() => {
//     fetchUserData();
//   }, [toggleRefresh, refresh, dispatch]);
// };

// export default useGetUserData;
