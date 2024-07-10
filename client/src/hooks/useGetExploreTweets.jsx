import axios from "axios";
import {TWEET_API_END_POINT} from "../utils/constant";
import {useEffect} from "react";
import {useDispatch} from "react-redux";
import {getexploreTweets} from "../redux/tweetSlice.jsx";
import {useSelector} from "react-redux";
const useGetExploreTweets = () => {
  const dispatch = useDispatch();
  const refresh = useSelector((state) => state.tweet.refresh);
  const toggleRefresh = useSelector((state) => state.user.refreshUser);

  const fetchExploreTweets = async () => {
    try {
      const allTweetsResponse = await axios.get(
        `${TWEET_API_END_POINT}/exploretweets`,
        {
          withCredentials: true,
        }
      );
      //console.log("hi i am in all tweet hook");
      // console.log(allTweetsResponse);
      dispatch(getexploreTweets(allTweetsResponse.data.posts));
    } catch (error) {
      console.error("Error fetching tweets:", error);
    }
  };

  useEffect(() => {
    fetchExploreTweets();
  }, [refresh, toggleRefresh, dispatch]);
};

export default useGetExploreTweets;
