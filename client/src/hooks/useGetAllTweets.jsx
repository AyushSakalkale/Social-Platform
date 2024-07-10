import axios from "axios";
import {TWEET_API_END_POINT} from "../utils/constant";
import {useEffect} from "react";
import {useDispatch} from "react-redux";
import {getAllTweets} from "../redux/tweetSlice.jsx";
import {useSelector} from "react-redux";
const useGetAllTweets = () => {
  const dispatch = useDispatch();
  const refresh = useSelector((state) => state.tweet.refresh);
  const toggleRefresh = useSelector((state) => state.user.refreshUser);

  const fetchAllTweets = async () => {
    try {
      const allTweetsResponse = await axios.get(
        `${TWEET_API_END_POINT}/alltweets`,
        {
          withCredentials: true,
        }
      );
      //console.log("hi i am in all tweet hook");
      // console.log(allTweetsResponse);
      dispatch(getAllTweets(allTweetsResponse.data.posts));
    } catch (error) {
      console.error("Error fetching tweets:", error);
    }
  };

  useEffect(() => {
    fetchAllTweets();
  }, [refresh, toggleRefresh, dispatch]);
};

export default useGetAllTweets;
