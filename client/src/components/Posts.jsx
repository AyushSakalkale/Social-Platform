import {useEffect} from "react";
import useGetAllTweets from "../hooks/useGetAllTweets.jsx";
import useGetMyTweets from "../hooks/useGetMyTweets.jsx";
import {getRefresh} from "../redux/tweetSlice.jsx";
import Post from "./Post.jsx";
import PostSkeleton from "./PostSkeleton.jsx";
import {useDispatch, useSelector} from "react-redux";

const Posts = ({type}) => {
  const isLoading = false;
  const reqtweets = useSelector((state) => {
    switch (type) {
      case "all":
        return state.tweet.tweets;
      case "particular":
        return state.tweet.particulartweets;
      case "explore":
        return state.tweet.exploretweets;
      case "likes":
        console.log(
          state.user.profile.likedPosts
            .map((id) =>
              state.tweet.exploretweets.find((tweet) => tweet._id === id)
            )
            .filter((tweet) => tweet !== undefined)
        );

        return state.user.profile.likedPosts
          .map((id) =>
            state.tweet.exploretweets.find((tweet) => tweet._id === id)
          )
          .filter((tweet) => tweet !== undefined); // Filter out undefined elements
    }
  });

  return (
    <>
      {isLoading && (
        <div className="flex flex-col justify-center">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}

      {!isLoading && reqtweets?.length === 0 && (
        <p className="text-center my-4">No posts in this tab. Switch 👻</p>
      )}
      {!isLoading && reqtweets && (
        <div>
          {reqtweets?.map((post) => (
            <Post key={post._id} post={post} />
          ))}
        </div>
      )}
    </>
  );
};
export default Posts;
