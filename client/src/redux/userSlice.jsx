import {createSlice} from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
    otherUsers: null,
    profile: null,
    refreshUser: false,
  },
  reducers: {
    getUser: (state, action) => {
      state.user = action.payload;
    },
    getOtherUsers: (state, action) => {
      state.otherUsers = action.payload;
    },
    getMyProfile: (state, action) => {
      state.profile = action.payload;
    },
    followingUpdate: (state, action) => {
      // unfollow
      if (state.user.following.includes(action.payload)) {
        state.user.following = state.user.following.filter((itemId) => {
          return itemId !== action.payload;
        });
      } else {
        // follow
        state.user.following.push(action.payload);
      }
    },
    toggleRefresh: (state) => {
      state.refreshUser = !state.refreshUser;
    },
    updateLikedPosts: (state, action) => {
      const postId = action.payload;
      if (state.user.likedPosts.includes(postId)) {
        state.user.likedPosts = state.user.likedPosts.filter(
          (id) => id !== postId
        );
      } else {
        state.user.likedPosts.push(postId);
      }
    },
    updateBookmarkPosts: (state, action) => {
      const postId = action.payload;
      if (state.user.bookmarks.includes(postId)) {
        state.user.bookmarks = state.user.bookmarks.filter(
          (id) => id !== postId
        );
      } else {
        state.user.bookmarks.push(postId);
      }
    },
    updateBio: (state, action) => {
      state.user.bio = action.payload;
    },
  },
});

export const {
  getUser,
  getOtherUsers,
  getMyProfile,
  followingUpdate,
  toggleRefresh,
  updateBio,
  updateLikedPosts,
  updateBookmarkPosts,
} = userSlice.actions;
export default userSlice.reducer;
