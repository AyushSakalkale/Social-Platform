import {FaRegComment, FaRegHeart, FaRegBookmark, FaTrash} from "react-icons/fa";
import {BiRepost} from "react-icons/bi";
import {useState, useEffect} from "react";
import {Link} from "react-router-dom";
import {useSelector, useDispatch} from "react-redux";
import toast from "react-hot-toast";
import axios from "axios";
import {
  TWEET_API_END_POINT,
  USER_API_END_POINT,
  timeSince,
} from "../utils/constant";
import {getRefresh} from "../redux/tweetSlice.jsx";
import {
  toggleRefresh,
  updateLikedPosts,
  updateBookmarkPosts,
} from "../redux/userSlice.jsx";

const Post = ({post}) => {
  const [comment, setComment] = useState("");
  const [commentsWithUser, setCommentsWithUser] = useState([]);
  const postOwner = post?.userDetails;
  const postOwnerId = post?.userId;

  const userIdLoggedIn = useSelector((state) => state.user.user?._id);
  const user = useSelector((store) => store.user.user);
  const formattedDate = timeSince(post.createdAt);
  let isMyPost = userIdLoggedIn === postOwnerId;
  let isLiked = user?.likedPosts?.includes(post?._id);
  let isBookmarked = user?.bookmarks?.includes(post?._id);

  const dispatch = useDispatch();

  const fetchCommentsWithUser = async () => {
    try {
      const commentsWithUserData = await Promise.all(
        post?.comments?.map(async (comment) => {
          const userResponse = await axios.get(
            `${USER_API_END_POINT}/getspecificprofile/${comment.userId}`,
            {withCredentials: true}
          );
          console.log("fetch comments with user");
          console.log(userResponse);
          return {...comment, userDetails: userResponse.data};
        })
      );
      setCommentsWithUser(commentsWithUserData);
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  useEffect(() => {
    if (post) {
      fetchCommentsWithUser();
    }
  }, [post, comment]);

  const handleDeletePost = async () => {
    try {
      const res = await axios.delete(
        `${TWEET_API_END_POINT}/delete/${post._id}`,
        {withCredentials: true}
      );
      toast.success(res?.data?.message);
      dispatch(getRefresh());
      // dispatch(toggleRefresh());
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${USER_API_END_POINT}/comment/${post._id}`,
        {text: comment},
        {withCredentials: true, headers: {"Content-Type": "application/json"}}
      );

      if (res.data.success) {
        toast.success(res.data.message);
        dispatch(getRefresh());
        // dispatch(toggleRefresh());
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  const handleLikePost = async () => {
    try {
      const res = await axios.put(
        `${USER_API_END_POINT}/like/${post._id}`,
        {id: user?._id},
        {withCredentials: true}
      );
      dispatch(updateLikedPosts(post._id));
      dispatch(toggleRefresh());
      dispatch(getRefresh());
      toast.success(res.data.message);
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  const handleBookmarkPost = async () => {
    try {
      const res = await axios.put(
        `${USER_API_END_POINT}/bookmark/${post._id}`,
        {id: user?._id},
        {withCredentials: true}
      );

      dispatch(updateBookmarkPosts(post._id));

      dispatch(toggleRefresh());
      dispatch(getRefresh());
      toast.success(res.data.message);
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  return (
    <>
      <div className="flex gap-2 items-start p-4 border-b border-gray-700">
        <div className="avatar">
          <Link
            to={`/profile/${postOwnerId}`}
            className="w-8 rounded-full overflow-hidden"
          >
            <img
              src={postOwner?.profileImg || "/avatar-placeholder.png"}
              alt="Profile"
            />
          </Link>
        </div>
        <div className="flex flex-col flex-1">
          <div className="flex gap-2 items-center">
            <Link to={`/profile/${postOwnerId}`} className="font-bold">
              {postOwner?.fullName}
            </Link>
            <span className="text-gray-700 flex gap-1 text-sm">
              <Link to={`/profile/${postOwnerId}`}>@{postOwner?.username}</Link>
              <span>·</span>
              <span>{formattedDate}</span>
            </span>
            {isMyPost && (
              <span className="flex justify-end flex-1">
                <FaTrash
                  className="cursor-pointer hover:text-red-500"
                  onClick={handleDeletePost}
                />
              </span>
            )}
          </div>
          <div className="flex flex-col gap-3 overflow-hidden">
            <span>{post?.text}</span>
            {post?.img && (
              <img
                src={post?.img}
                className="h-80 object-contain rounded-lg border border-gray-700"
                alt="Post"
              />
            )}
          </div>
          <div className="flex justify-between mt-3">
            <div className="flex gap-4 items-center w-2/3 justify-between">
              <div
                className="flex gap-1 items-center cursor-pointer group"
                onClick={() =>
                  document
                    .getElementById("comments_modal" + post?._id)
                    .showModal()
                }
              >
                <FaRegComment className="w-4 h-4 text-slate-500 group-hover:text-sky-400" />
                <span className="text-sm text-slate-500 group-hover:text-sky-400">
                  {post?.comments?.length}
                </span>
              </div>
              <dialog
                id={`comments_modal${post._id}`}
                className="modal border-none outline-none"
              >
                <div className="modal-box rounded border border-gray-600">
                  <h3 className="font-bold text-lg mb-4">COMMENTS</h3>
                  <div className="flex flex-col gap-3 max-h-60 overflow-auto">
                    {post?.comments?.length === 0 && (
                      <p className="text-sm text-slate-500">
                        No comments yet 🤔 Be the first one 😉
                      </p>
                    )}
                    {commentsWithUser.map((comment) => (
                      <div key={comment._id} className="flex gap-2 items-start">
                        <div className="avatar">
                          <div className="w-8 rounded-full">
                            <img
                              src={
                                comment?.userDetails?.user?.profileImg ||
                                "/avatar-placeholder.png"
                              }
                              alt="Commenter"
                            />
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1">
                            <span className="font-bold">
                              {comment?.userDetails?.user?.fullName}
                            </span>
                            <span className="text-gray-700 text-sm">
                              @{comment?.userDetails?.user?.username}
                            </span>
                          </div>
                          <div className="text-sm">{comment?.text}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <form
                    className="flex gap-2 items-center mt-4 border-t border-gray-600 pt-2"
                    onSubmit={handlePostComment}
                  >
                    <textarea
                      className="textarea w-full p-1 rounded text-md resize-none border focus:outline-none border-gray-800"
                      placeholder="Add a comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                    <button className="btn btn-primary rounded-full btn-sm text-white px-4">
                      Post
                    </button>
                  </form>
                </div>
                <form method="dialog" className="modal-backdrop">
                  <button className="outline-none">close</button>
                </form>
              </dialog>
              <div className="flex gap-1 items-center group cursor-pointer">
                <BiRepost className="w-6 h-6 text-slate-500 group-hover:text-green-500" />
                <span className="text-sm text-slate-500 group-hover:text-green-500">
                  0
                </span>
              </div>
              <div
                className="flex gap-1 items-center group cursor-pointer"
                onClick={handleLikePost}
              >
                {!isLiked ? (
                  <FaRegHeart className="w-4 h-4 cursor-pointer text-slate-500 group-hover:text-pink-500" />
                ) : (
                  <FaRegHeart className="w-4 h-4 cursor-pointer text-pink-500" />
                )}
                <span
                  className={`text-sm text-slate-500 group-hover:text-pink-500 ${
                    isLiked ? "text-pink-500" : ""
                  }`}
                >
                  {post?.likeCount}
                </span>
              </div>
            </div>
            <div className="flex w-1/3 justify-end gap-2 items-center">
              {/* <FaRegBookmark className="w-4 h-4 text-slate-500 cursor-pointer" /> */}
              <div
                className="flex gap-1 items-center group cursor-pointer"
                onClick={handleBookmarkPost}
              >
                {!isBookmarked ? (
                  <FaRegBookmark className="w-4 h-4 cursor-pointer text-slate-500 group-hover:text-blue-500" />
                ) : (
                  <FaRegBookmark className="w-4 h-4 cursor-pointer text-blue-500" />
                )}
                <span
                  className={`text-sm text-slate-500 group-hover:text-blue-500 ${
                    isBookmarked ? "text-blue-500" : ""
                  }`}
                >
                  {}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Post;
