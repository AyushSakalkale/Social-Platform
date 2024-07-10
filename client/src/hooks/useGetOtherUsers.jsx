import axios from "axios";
import {USER_API_END_POINT} from "../utils/constant";
import {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {getOtherUsers} from "../redux/userSlice";

const useOtherUsers = () => {
  const dispatch = useDispatch();
  const refresh = useSelector((state) => state.tweet.refresh);
  const toggleRefresh = useSelector((state) => state.user.refreshUser);

  useEffect(() => {
    const fetchOtherUsers = async () => {
      try {
        const res = await axios.get(`${USER_API_END_POINT}/otheruser`, {
          withCredentials: true,
        });
        dispatch(getOtherUsers(res?.data?.otherUsers));
      } catch (error) {
        console.log(error);
      }
    };
    fetchOtherUsers();
  }, [refresh, toggleRefresh]);
};

export default useOtherUsers;
