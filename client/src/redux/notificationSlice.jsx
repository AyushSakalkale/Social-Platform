import {createSlice, createAsyncThunk} from "@reduxjs/toolkit";
import axios from "axios";
import {NOTIFICATION_API_END_POINT} from "../utils/constant";
// Async thunk to fetch notifications
export const fetchNotifications = createAsyncThunk(
  "notification/fetchNotification",
  async () => {
    const res = await axios.get(`${NOTIFICATION_API_END_POINT}/`, {
      withCredentials: true,
    });
    if (!res) {
      throw new Error("Failed to fetch notification");
    }
    //console.log(res.data);
    return res.data;
  }
);

// Async thunk to delete notifications
export const deleteNotifications = createAsyncThunk(
  "notification/deleteNotification",
  async () => {
    const res = await axios.delete(`${NOTIFICATION_API_END_POINT}/`, {
      withCredentials: true,
    });
    if (!res) {
      throw new Error("Failed to delete notifications");
    }
    //console.log(res.data);
    return res.data;
  }
);
const notificationSlice = createSlice({
  name: "notification",
  initialState: {
    notifications: [],
    status: "idle",
    error: null,
  },
  reducers: {
    getNotification: (state, action) => {
      (state.notifications = action.payload),
        (state.status = "idle"),
        (state.error = null);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.notifications = action.payload.data;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload.error || action.error.message;
      })
      .addCase(deleteNotifications.fulfilled, (state) => {
        state.notifications = [];
      });
  },
});
export const {getNotification} = notificationSlice.actions;

export default notificationSlice.reducer;
