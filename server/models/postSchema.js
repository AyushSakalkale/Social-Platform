import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
    },
    img: {
      type: String,
    },
    userDetails: {
      username: {
        type: String,
        required: true,
      },
      fullName: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      profileImg: {
        type: String,
        required: true,
      },
      link: {
        type: String,
        default: "",
      },
    },
    likeCount: {
      type: Number,
      default: 0,
    },
    comments: [
      {
        text: {
          type: String,
          required: true,
        },
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      },
    ],
  },
  {timestamps: true}
);

export const Post = mongoose.model("Post", postSchema);
