import {User} from "../models/userSchema.js";
import {Post} from "../models/postSchema.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import {v2 as cloudinary} from "cloudinary";
import dotenv from "dotenv";
import uploadFile from "./upload.js";
import Notification from "../models/notificationSchema.js";
import nodemailer from "nodemailer";
import {USER_API_END_POINT} from "../../client/src/utils/constant.js";

dotenv.config({});
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const Signup = async (req, res) => {
  try {
    const {fullName, username, email, password} = req.body;

    if (!fullName || !username || !email || !password) {
      return res.status(401).json({
        message: "All fields are required.",
        success: false,
      });
    }
    const user = await User.findOne({email});
    if (user) {
      return res.status(401).json({
        message: "User already exists.",
        success: false,
      });
    }

    const hashedPassword = await bcryptjs.hash(password, 16);

    await User.create({
      fullName,
      username,
      email,
      password: hashedPassword,
    });
    return res.status(201).json({
      message: "Account created successfully.",
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({error: error.message});
  }
};

export const Login = async (req, res) => {
  try {
    const {username, password} = req.body;
    if (!username || !password) {
      return res.status(401).json({
        message: "All fields are required.",
        success: false,
      });
    }
    const user = await User.findOne({username});
    if (!user) {
      return res.status(401).json({
        message: "Incorrect username or password",
        success: false,
      });
    }
    const isMatch = await bcryptjs.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Incorrect username or password",
        success: false,
      });
    }
    const tokenData = {
      userId: user._id,
    };
    const token = await jwt.sign(tokenData, process.env.TOKEN_SECRET, {
      expiresIn: "1d",
    });

    return res
      .status(201)
      .cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
      })
      .json({
        message: `Welcome back ${user.username}`,
        user,
        success: true,
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({error: error.message});
  }
};

export const Logout = (req, res) => {
  return res.cookie("token", "", {expires: new Date(0)}).json({
    message: "User logged out successfully.",
    success: true,
  });
};

export const follow = async (req, res) => {
  try {
    const loggedInUserId = req.user;
    const userId = req.params.id;
    const loggedInUser = await User.findById(loggedInUserId);
    const user = await User.findById(userId);

    if (!loggedInUser || !user) {
      return res.status(404).json({
        message: "User not found.",
        success: false,
      });
    }

    if (!user.followers.includes(loggedInUserId)) {
      await user.updateOne({$push: {followers: loggedInUserId}});
      await loggedInUser.updateOne({$push: {following: userId}});
    } else {
      return res.status(400).json({
        message: `User already followed ${user.username}`,
      });
    }
    const notification = await Notification.create({
      from: loggedInUserId,
      to: userId,
      type: "follow",
      content: `${loggedInUser.username} just followed you.`,
    });

    return res.status(200).json({
      message: `${loggedInUser.username} just followed ${user.username}`,
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({error: error.message});
  }
};

export const unfollow = async (req, res) => {
  try {
    const loggedInUserId = req.user;
    const userId = req.params.id;
    const loggedInUser = await User.findById(loggedInUserId);
    const user = await User.findById(userId);

    if (!loggedInUser || !user) {
      return res.status(404).json({
        message: "User not found.",
        success: false,
      });
    }
    if (loggedInUser.following.includes(userId)) {
      await user.updateOne({$pull: {followers: loggedInUserId}});
      await loggedInUser.updateOne({$pull: {following: userId}});
    } else {
      return res.status(400).json({
        message: `User has not followed yet`,
      });
    }
    const notification = await Notification.create({
      from: loggedInUserId,
      to: userId,
      type: "follow",
      content: `${loggedInUser.username} just unfollowed you.`,
    });

    return res.status(200).json({
      message: `${loggedInUser.username} just unfollowed ${user.username}`,
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({error: error.message});
  }
};

export const bookmark = async (req, res) => {
  try {
    const loggedInUserId = req.user;
    const tweetId = req.params.id;
    const user = await User.findById(loggedInUserId);
    const post = await Post.findById(tweetId);

    if (user.bookmarks.includes(tweetId)) {
      await User.findByIdAndUpdate(loggedInUserId, {
        $pull: {bookmarks: tweetId},
      });
      return res.status(200).json({
        message: "Removed from bookmarks.",
      });
    } else {
      await User.findByIdAndUpdate(loggedInUserId, {
        $push: {bookmarks: tweetId},
      });
      return res.status(200).json({
        message: "Saved to bookmarks.",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({error: error.message});
  }
};

export const likeOrDislike = async (req, res) => {
  try {
    const loggedInUserId = req.user;
    const postId = req.params.id;

    const post = await Post.findById(postId);
    const user = await User.findById(loggedInUserId);
    if (user.likedPosts.includes(postId)) {
      // dislike
      post.likeCount -= 1;

      const notification = await Notification.create({
        from: loggedInUserId,
        to: post.userId,
        type: "like",
        content: `${user.username} disliked your tweet.`,
      });

      await post.save();

      await User.findByIdAndUpdate(loggedInUserId, {
        $pull: {likedPosts: postId},
      });
      return res.status(200).json({
        message: "User disliked your tweet.",
      });
    } else {
      // like
      post.likeCount += 1;

      const notification = await Notification.create({
        from: loggedInUserId,
        to: post.userId,
        type: "like",
        content: `${user.username} liked your tweet.`,
      });

      await post.save();
      await User.findByIdAndUpdate(loggedInUserId, {
        $push: {likedPosts: postId},
      });
      return res.status(200).json({
        message: "User liked your tweet.",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

export const getMyProfile = async (req, res) => {
  try {
    const loggedInUserId = req.user;
    const user = await User.findById(loggedInUserId);
    return res.status(200).json({
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({error: error.message});
  }
};
export const getSpecificProfile = async (req, res) => {
  try {
    const UserId = req?.params?.id;
    const user = await User.findById(UserId).select("-password");
    return res.status(200).json({
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({error: error.message});
  }
};

export const getOtherUsers = async (req, res) => {
  try {
    const loggedInUserId = req.user;
    const otherUsers = await User.find({_id: {$ne: loggedInUserId}}).select(
      "-password"
    );
    if (!otherUsers) {
      return res.status(401).json({
        message: "Currently do not have any users.",
      });
    }
    return res.status(200).json({
      otherUsers,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({error: error.message});
  }
};

export const deleteNotifications = async (req, res) => {
  try {
    const loggedInUserId = req.user;

    await Notification.deleteMany({to: loggedInUserId});

    res.status(200).json({message: "Notifications deleted successfully"});
  } catch (error) {
    console.log("Error in deleteNotifications function", error.message);
    res.status(500).json({error: "Internal Server Error"});
  }
};

// export const updateUserProfile = async (req, res) => {
//   try {
//     const {fullName, email, username, currentPassword, newPassword, bio, link} =
//       req.body;
//     if (
//       (!newPassword && currentPassword) ||
//       (!currentPassword && newPassword)
//     ) {
//       return res
//         .status(400)
//         .json({error: "Please provide both current password and new password"});
//     }
//     const loggedInUserId = req.user;
//     const user = await User.findById(loggedInUserId);

//     if (currentPassword && newPassword) {
//       const isMatch = await bcryptjs.compare(currentPassword, user.password);
//       if (!isMatch)
//         return res.status(400).json({error: "Current password is incorrect"});

//       const hashedNewPassword = await bcryptjs.hash(newPassword, 16);

//       user.password = hashedNewPassword;
//     }
//     user.fullName = fullName || user.fullName;
//     user.email = email || user.email;
//     user.username = username || user.username;
//     user.bio = bio || user.bio;
//     user.link = link || user.link;

//     await user.save();

//     return res.status(200).json({
//       user,
//       message: "Successfully edited profile",
//       success: true,
//     });
//   } catch (error) {
//     console.log("Error in updateUser: ", error.message);
//     res.status(500).json({error: error.message});
//   }
// };

export const updateUserBio = async (req, res) => {
  try {
    const loggedInUserId = req.user;
    const user = await User.findById(loggedInUserId);
    let {bio} = req.body;
    if (!bio) {
      bio = "Hey using X 🔥";
    }

    user.bio = bio;

    await user.save();
    return res.status(200).json({
      user,
      message: "Successfully edited bio",
      success: true,
    });
  } catch (error) {
    console.log("Error in updateUser: ", error.message);
    res.status(500).json({error: error.message});
  }
};

export const updateAvatar = async (req, res) => {
  try {
    const loggedInUserId = req.user;
    const user = await User.findById(loggedInUserId);

    let img;
    if (req.file) {
      const uploadResponse = await uploadFile(req.file.path);
      img = uploadResponse.secure_url;
    }

    if (user.profileImg) {
      await cloudinary.uploader.destroy(
        user.profileImg.split("/").pop().split(".")[0]
      );
    }

    user.profileImg = img || "";

    await user.save();

    return res.status(200).json({
      user,
      message: "Successfully edited Avatar",
      success: true,
    });
  } catch (error) {
    console.log("Error in updateAvatar: ", error.message);
    res.status(500).json({error: error.message});
  }
};

export const updateCoverImg = async (req, res) => {
  try {
    const loggedInUserId = req.user;
    const user = await User.findById(loggedInUserId);

    let img;
    if (req.file) {
      const uploadResponse = await uploadFile(req.file.path);
      img = uploadResponse.secure_url;
    }

    if (user.coverImg) {
      await cloudinary.uploader.destroy(
        user.coverImg.split("/").pop().split(".")[0]
      );
    }

    user.coverImg = img || "";

    await user.save();

    return res.status(200).json({
      user,
      message: "Successfully edited coverImg",
      success: true,
    });
  } catch (error) {
    console.log("Error in updateCoverImg: ", error.message);
    res.status(500).json({error: error.message});
  }
};

export const getOtherProfile = async (req, res) => {
  try {
    const id = req?.params?.id;
    const user = await User.findById(id).select("-password");
    return res.status(200).json({
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({error: error.message});
  }
};

export const commentOnPost = async (req, res) => {
  try {
    const {text} = req.body;
    const postId = req.params.id;
    const loggedInUserId = req.user;
    if (!loggedInUserId) {
      return res.status(409).json({error: "user  field is required"});
    }

    if (!text) {
      return res.status(400).json({error: "Text field is required"});
    }
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({error: "Post not found"});
    }

    const comment = {userId: loggedInUserId, text};

    post.comments.push(comment);
    await post.save();

    return res.status(200).json({
      post,
      message: `username just commented`,
      success: true,
    });
  } catch (error) {
    console.log("Error in commentOnPost controller: ", error);
    res.status(500).json({error: "Internal server error"});
  }
};

// export const forgotPassword = async (req, res) => {
//   try {
//     const email=req?.email;
//     const user = User.findByEmail(email);
//     if(!user)
//     {
//       res.status(202).json({error: "There is no user having this email"});
//     }

//     const server = http.createServer((request, response) => {
//       const auth = nodemailer.createTransport({
//         service: "gmail",
//         secure: true,
//         port: 465,
//         auth: {
//           user: "ayushsakalkale@gmail.com",
//           pass: "ylir ngzh yogp fhpu",
//         },
//       });

//       const receiver = {
//         from: "ayushsakalkale@gmail.com",
//         to: `${user?.email}`,
//         subject: "Node Js Mail Testing! You forgot your password",
//         text: "Hello this is a text mail! You forgot your password your otp is ",
//       };

//       auth.sendMail(receiver, (error, emailResponse) => {
//         if (error) throw error;
//         console.log("success!");
//         response.end();
//       });
//     });
//   } catch (error) {
//     console.log("Error in sending mail");
//     console.log(error);
//   }
// };

export const forgetPassword = async (req, res) => {
  try {
    const {email} = req.body;
    if (!email) {
      return res.status(400).send({message: "Please provide email"});
    }
    const checkUser = await User.findOne({email});
    if (!checkUser) {
      return res.status(400).send({message: "User not found please register"});
    }
    const token = jwt.sign({email}, process.env.TOKEN_SECRET, {
      expiresIn: "15m",
    });
    const transporter = nodemailer.createTransport({
      service: "gmail",
      secure: true,
      port: 465,
      auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_EMAIL_PASSWORD,
      },
    });

    const receiver = {
      from: process.env.USER_EMAIL,
      to: `${checkUser?.email}`,
      subject: "Password Reset Request",
      html: `<!DOCTYPE html> 
<html lang="en">
   <head>
      <meta charset="UTF-8">

      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset</title>
      <style> body { 
      font-family: Arial, sans-serif; 
      line-height: 1.6; c
      olor: #000000; 
      /* Neutral */ background-color: #f9f7f3;
       /* Base-100 */ margin: 0; padding: 20px;
        } 
      .container { max-width: 600px; 
      margin: 0 auto; background-color: #b5e2fa; 
      /* Primary */ padding: 30px;
       border-radius: 5px;
       box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); 
       } h1 { color: #000000; 
        /* Secondary */ margin-bottom: 20px; 
        } p { margin-bottom: 20px; color: #000000;
          /* Neutral */ } .button { display: inline-block;
           padding: 10px 20px; background-color: #d20000; 
           /* Accent */ color: #fff; 
           text-decoration: none; border-radius: 5px; } 
      
      </style>
   </head>

   <body>
      <div class="container">
         <h1>Password Reset</h1>
         <p>Dear ${checkUser?.username},</p>

         <p>To reset your password, please click on the following link:</p>
         <p>
         <a href="https://social-media-psl-ten.vercel.app/reset-password/${token}" class="button">Reset Password</a>
         </p>


         <p>If you did not request a password reset, please disregard this email.</p>
         <p>Best regards,<br>[Team Pushpak]</p>

      </div>
   </body>
</html>
`,
    };

    await transporter.sendMail(receiver);

    return res.status(200).json({
      message: "Password reset link send successfully on your gmail account",
    });
  } catch (error) {
    return res.status(500).json({message: "Something went wrong"});
  }
};

export const resetPassword = async (req, res) => {
  try {
    const {token} = req.params;
    const {password} = req.body;
    if (!password) {
      return res.status(400).json({message: "Please provide password"});
    }
    const decode = jwt.verify(token, process.env.TOKEN_SECRET);

    const user = await User.findOne({email: decode.email});

    if (!user) {
      return res.status(400).json({message: "User not found"});
    }

    const newhashPassword = await bcryptjs.hash(password, 16);

    user.password = newhashPassword;

    await user.save();

    return res.status(200).json({message: "Password reset successfully"});
  } catch (error) {
    return res.status(500).json({message: "Something went wrong"});
  }
};
