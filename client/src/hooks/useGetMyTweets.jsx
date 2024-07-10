import axios from "axios";
import {TWEET_API_END_POINT} from "../utils/constant";
import {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {getParticularTweets} from "../redux/tweetSlice.jsx";

const useGetMyTweets = (id) => {
  const dispatch = useDispatch();
  // const {refresh} = useSelector((store) => store.tweet);
  // const {toggleRefresh} = useSelector((store) => store.user);
  const refresh = useSelector((state) => state.tweet.refresh);
  const toggleRefresh = useSelector((state) => state.user.refreshUser);

  const fetchMyTweets = async () => {
    try {
      console.log("Fetching tweets for user ID:", id);
      const userTweetsResponse = await axios.get(
        `${TWEET_API_END_POINT}/alltweets/${id}`,
        {
          withCredentials: true,
        }
      );
      console.log("Fetched User Tweets:", userTweetsResponse.data);
      dispatch(getParticularTweets(userTweetsResponse.data.particularPosts));
    } catch (error) {
      console.error("Error fetching tweets:", error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchMyTweets();
    } else {
      console.log("No ID provided, skipping fetch");
    }
  }, [id, dispatch, refresh, toggleRefresh]);

  return null;
};

export default useGetMyTweets;
