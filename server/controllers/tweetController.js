import {Post} from "../models/postSchema.js";
import {User} from "../models/userSchema.js";
import uploadFile from "./upload.js";
import {v2 as cloudinary} from "cloudinary";
import dotenv from "dotenv";

dotenv.config({});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const createPost = async (req, res) => {
  try {
    const {text} = req.body;
    const loggedInUserId = req.user;

    if (!text || !loggedInUserId) {
      return res.status(401).json({
        message: "Fields are required.",
        success: false,
      });
    }

    let img;

    if (req.file) {
      const uploadResponse = await uploadFile(req.file.path);
      img = uploadResponse.secure_url;
    }

    const user = await User.findById(loggedInUserId).select("-password");

    const userDetails = {
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      profileImg: user.profileImg,
      link: user.link,
    };

    await Post.create({
      userId: loggedInUserId,
      userDetails: userDetails,
      img: img || "",
      text: text,
    });

    return res.status(200).json({
      message: `Tweet Created`,
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error",
      success: false,
    });
  }
};
export const deleteTweet = async (req, res) => {
  try {
    const {id} = req.params;
    //console.log("Received ID:", id); // Add debug log for id

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({message: "Tweet not found."});
    }
    //console.log("Found Post:", post); // Add debug log for the post

    if (post.img) {
      const imgId = post.img.split("/").pop().split(".")[0];
      //console.log("Extracted Image ID:", imgId); // Add debug log for imgId

      try {
        await cloudinary.uploader.destroy(imgId);
        //console.log("Image deleted successfully from Cloudinary."); // Confirm successful image deletion
      } catch (cloudinaryError) {
        console.error("Error deleting image from Cloudinary:", cloudinaryError);
        return res
          .status(500)
          .json({message: "Error deleting image from Cloudinary."});
      }
    }

    await Post.findByIdAndDelete(id);
    //console.log("Post deleted successfully."); // Confirm post deletion

    return res.status(200).json({
      message: "Tweet deleted successfully.",
      success: true,
    });
  } catch (error) {
    console.log("Error:", error);
    return res.status(500).json({message: "Server error."});
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const loggedInUserId = req.user;
    if (!loggedInUserId) {
      return res
        .status(400)
        .json({error: "User ID parameter missing or invalid"});
    }

    const loggedInUser = await User.findById(loggedInUserId);
    if (!loggedInUser) {
      return res.status(404).json({error: "Logged in User not found"});
    }
    const loggedInUserTweets = await Post.find({userId: loggedInUserId});
    const followingUserTweets = await Promise.all(
      loggedInUser.following.map((otherUserId) =>
        Post.find({userId: otherUserId})
      )
    );

    const allTweets = loggedInUserTweets.concat(...followingUserTweets);

    return res.status(200).json({posts: allTweets});
  } catch (error) {
    console.error("Error fetching tweets:", error);
    return res.status(500).json({error: "Server error"});
  }
};
export const getFollowingPosts = async (req, res) => {
  try {
    const loggedInUserId = req.user;
    if (!loggedInUserId) {
      return res
        .status(400)
        .json({error: "User ID parameter missing or invalid"});
    }
    const loggedInUser = await User.findById(loggedInUserId);
    if (!loggedInUser) {
      return res.status(404).json({error: "Logged in User not found"});
    }

    const followingUserTweets = await Promise.all(
      loggedInUser.following.map((otherUserId) =>
        Post.find({userId: otherUserId})
      )
    );

    const allTweets = followingUserTweets;

    return res.status(200).json({posts: allTweets});
  } catch (error) {
    console.error("Error fetching tweets:", error);
    return res.status(500).json({error: "Server error"});
  }
};

export const getExplorePosts = async (req, res) => {
  try {
    const loggedInUserId = req.user;
    if (!loggedInUserId) {
      return res
        .status(400)
        .json({error: "User ID parameter missing or invalid"});
    }
    const loggedInUser = await User.findById(loggedInUserId);
    if (!loggedInUser) {
      return res.status(404).json({error: "Logged in User not found"});
    }

    const allExploreTweets = await Post.find({});

    return res.status(200).json({posts: allExploreTweets});
  } catch (error) {
    console.error("Error fetching tweets:", error);
    return res.status(500).json({error: "Server error"});
  }
};

export const getParticularIdPosts = async (req, res) => {
  try {
    const loggedInUserId = req.user; // Ensure you are extracting the user ID from req.user
    const userId = req.params.id; // Get the user ID from request parameters
    // console.log(userId);
    // console.log(loggedInUserId);

    if (!loggedInUserId) {
      return res.status(400).json({error: "NOT LOGGED IN"});
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({error: "User not found"});
    }

    const particularPosts = await Post.find({userId: userId}); // Find posts where userId matches

    return res.status(200).json({particularPosts});
  } catch (error) {
    console.error("Error fetching posts:", error);
    return res.status(500).json({error: "Server error"});
  }
};
