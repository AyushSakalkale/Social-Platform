import express from "express";
import multer from "multer";

import {
  createPost,
  getAllPosts,
  getFollowingPosts,
  getParticularIdPosts,
  deleteTweet,
  getExplorePosts,
} from "../controllers/tweetController.js";
import isAuthenticated from "../config/auth.js";

const storage = multer.memoryStorage();
const upload = multer({
  storage: multer.diskStorage({}),
});

const router = express.Router();

router.route("/create").post(isAuthenticated, upload.single("img"), createPost);

router.route("/alltweets").get(isAuthenticated, getAllPosts); //feed of all our and follower posts
router.route("/following-tweets").get(isAuthenticated, getFollowingPosts);
router.route("/alltweets/:id").get(isAuthenticated, getParticularIdPosts); ////feed of id posts
router.route("/delete/:id").delete(isAuthenticated, deleteTweet);
router.route("/exploretweets").get(isAuthenticated, getExplorePosts);
export default router;
