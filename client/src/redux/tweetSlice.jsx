import {createSlice} from "@reduxjs/toolkit";

const tweetSlice = createSlice({
  name: "tweet",
  initialState: {
    tweets: null,
    refresh: false,
    isActive: true,
    particulartweets: null,
    exploretweets: null,
  },
  reducers: {
    getAllTweets: (state, action) => {
      state.tweets = action.payload;
    },
    getRefresh: (state) => {
      state.refresh = !state.refresh;
    },
    getIsActive: (state, action) => {
      state.isActive = action.payload;
    },
    getParticularTweets: (state, action) => {
      state.particulartweets = action.payload;
    },
    clearParticularTweets: (state) => {
      state.particulartweets = [];
    },
    getexploreTweets: (state, action) => {
      state.exploretweets = action.payload;
    },
  },
});

export const {
  getAllTweets,
  getRefresh,
  getIsActive,
  getParticularTweets,
  clearParticularTweets,
  getexploreTweets,
} = tweetSlice.actions;

export default tweetSlice.reducer;
