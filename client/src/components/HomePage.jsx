import {useEffect, useState} from "react";

import Posts from "./Posts.jsx";
import CreatePost from "./CreatePost.jsx";
import LeftSidebar from "./LeftSidebar.jsx";
import RightSidebar from "./RightSidebar.jsx";
import useGetAllTweets from "../hooks/useGetAllTweets.jsx";
import useOtherUsers from "../hooks/useGetOtherUsers.jsx";
import useGetExploreTweets from "../hooks/useGetExploreTweets.jsx";
import {useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";

const HomePage = () => {
  const user = useSelector((state) => state?.user);
  console.log(user);

  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user === "{}") {
      console.log("Navigating to /login due to no user");
      navigate("/login");
    }
  }, [navigate, user]);

  const [feedType, setFeedType] = useState("all");

  useGetExploreTweets();
  useGetAllTweets();
  useOtherUsers();

  return (
    <>
      <LeftSidebar />

      <div className="flex-[4_4_0] mr-auto border-r border-gray-700 min-h-screen">
        {/* Header */}
        <div className="flex w-full border-b border-gray-700">
          <div
            className={
              "flex justify-center flex-1 p-3 hover:bg-secondary transition duration-300 cursor-pointer relative"
            }
            onClick={() => setFeedType("all")}
          >
            Following
            {feedType === "all" && (
              <div className="absolute bottom-0 w-10  h-1 rounded-full bg-primary"></div>
            )}
          </div>

          <div
            className="flex justify-center flex-1 p-3 hover:bg-secondary transition duration-300 cursor-pointer relative"
            onClick={() => setFeedType("explore")}
          >
            For You
            {feedType === "explore" && (
              <div className="absolute bottom-0 w-10  h-1 rounded-full bg-primary"></div>
            )}
          </div>
        </div>

        {/*  CREATE POST INPUT */}
        <CreatePost />

        {/* POSTS */}
        <Posts type={feedType} />
      </div>

      <RightSidebar />
    </>
  );
};
export default HomePage;
