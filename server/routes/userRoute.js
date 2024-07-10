import express from "express";
import multer from "multer";

import {
  Signup,
  Login,
  Logout,
  follow,
  unfollow,
  bookmark,
  getMyProfile,
  getOtherUsers,
  deleteNotifications,
  updateAvatar,
  updateCoverImg,
  getOtherProfile,
  commentOnPost,
  getSpecificProfile,
  likeOrDislike,
  updateUserBio,
  forgetPassword,
  resetPassword,
} from "../controllers/userController.js";
import isAuthenticated from "../config/auth.js";
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: multer.diskStorage({}),
});

router.route("/login").post(Login);
router.route("/signup").post(Signup);
router.route("/logout").get(Logout);
router.route("/forgetpassword").post(forgetPassword);
router.route("/reset-password/:token").post(resetPassword);
router.route("/updateBio").put(isAuthenticated, updateUserBio);
router
  .route("/updateavatar")
  .put(isAuthenticated, upload.single("profileImg"), updateAvatar);
router
  .route("/updatecoverimg")
  .put(isAuthenticated, upload.single("coverImg"), updateCoverImg);
router.route("/follow/:id").post(isAuthenticated, follow);
router.route("/unfollow/:id").post(isAuthenticated, unfollow);
router.route("/bookmark/:id").put(isAuthenticated, bookmark);
router.route("/profile/:id").get(isAuthenticated, getOtherProfile);
router.route("/profile").get(isAuthenticated, getMyProfile);
router.route("/otheruser").get(isAuthenticated, getOtherUsers);
router.route("/like/:id").put(isAuthenticated, likeOrDislike);
router
  .route("/deletenotification")
  .delete(isAuthenticated, deleteNotifications);
router.route("/comment/:id").post(isAuthenticated, commentOnPost);
router
  .route("/getspecificprofile/:id")
  .get(isAuthenticated, getSpecificProfile);
export default router;
