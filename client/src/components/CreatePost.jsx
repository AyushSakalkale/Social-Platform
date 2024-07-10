import {CiImageOn} from "react-icons/ci";
import {BsEmojiSmileFill} from "react-icons/bs";
import {useEffect, useRef, useState} from "react";
import {IoCloseSharp} from "react-icons/io5";
import {useDispatch, useSelector} from "react-redux";
import axios from "axios";
import {TWEET_API_END_POINT} from "../utils/constant";
import toast from "react-hot-toast";
import {getRefresh} from "../redux/tweetSlice";
import useGetAllTweets from "../hooks/useGetAllTweets";
import {useNavigate} from "react-router-dom";
const CreatePost = () => {
  const [text, setText] = useState("");
  const [img, setImg] = useState(null);
  const [imgFile, setImgFile] = useState(null);

  const imgRef = useRef(null);
  const dispatch = useDispatch();

  const {profileImg} = useSelector((store) => store?.user?.user || "");

  const isPending = false;
  const isError = false;
  useGetAllTweets();
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("text", text);

      if (imgFile) {
        formData.append("img", imgFile);
      }

      const response = await axios.post(
        `${TWEET_API_END_POINT}/create`,
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
        setText("");
        setImg(null);
        setImgFile(null);
        imgRef.current.value = null;
      }
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    }
  };

  const handleImgChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImgFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImg(reader.result); // Store the base64 string for preview
      };
      reader.readAsDataURL(file); // Convert the file to a base64 string
    }
  };

  return (
    <div className="flex p-4 items-start gap-4 border-b border-gray-700">
      <div className="avatar">
        <div className="w-8 rounded-full">
          <img src={profileImg || "/avatar-placeholder.png"} alt="Profile" />
        </div>
      </div>
      <form className="flex flex-col gap-2 w-full" onSubmit={handleSubmit}>
        <textarea
          className="textarea w-full p-0 text-lg resize-none border-none focus:outline-none border-gray-800"
          placeholder="What is happening?!"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        {img && (
          <div className="relative w-72 mx-auto">
            <IoCloseSharp
              className="absolute top-0 right-0 text-white bg-gray-800 rounded-full w-5 h-5 cursor-pointer"
              onClick={() => {
                setImg(null);
                setImgFile(null);
                imgRef.current.value = null;
              }}
            />
            <img
              src={img}
              className="w-full mx-auto h-72 object-contain rounded"
              alt="Selected"
            />
          </div>
        )}

        <div className="flex justify-between border-t py-2 border-t-gray-700">
          <div className="flex gap-1 items-center">
            <CiImageOn
              className="fill-primary w-6 h-6 cursor-pointer"
              onClick={() => imgRef.current.click()}
            />
            <BsEmojiSmileFill className="fill-primary w-5 h-5 cursor-pointer" />
          </div>
          <input type="file" hidden ref={imgRef} onChange={handleImgChange} />
          <button
            className="btn btn-primary rounded-full btn-sm text-white px-4"
            disabled={isPending}
          >
            {isPending ? "Posting..." : "Post"}
          </button>
        </div>
        {isError && <div className="text-red-500">Something went wrong</div>}
      </form>
    </div>
  );
};

export default CreatePost;
