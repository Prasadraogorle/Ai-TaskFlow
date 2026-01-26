import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
// Open Google OAuth in browser
export const connectGoogleCalendar = createAsyncThunk(
  "google/connect",
  async ({ goalId }, { getState, rejectWithValue }) => {
    const user = getState().auth.user;
    if (!user?.id) return rejectWithValue("User not authenticated");

    // Pack both values into state
    const stateData = JSON.stringify({
      userId: user.id,
      goalId
    });

    window.open(
      `http://localhost:5000/api/google/auth?state=${encodeURIComponent(stateData)}`,
      "_blank"
    );

    return true;
  }
);




// Add daily tasks to calendar
export const addTasksToCalendar = createAsyncThunk(
  "google/addTasks",
  async ({ goalId }, { getState, dispatch, rejectWithValue }) => {
    try {
      const token = getState().auth.accessToken;

      const res = await axios.post(
        "http://localhost:5000/api/google/calendar/add",
        { goalId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return res.data;
    } catch (err) {
      const message = err.response?.data?.message || "Add calendar failed";

      if (message.includes("Google Calendar disconnected")) {
        dispatch(initializeAuthThunk()); // 👈 refresh auth
      }

      return rejectWithValue(message);
    }
  }
);



// Remove daily tasks from calendar
export const removeTasksFromCalendar = createAsyncThunk(
  "google/removeTasks",
  async ({ goalId }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.accessToken;

      const res = await axios.post(
        "http://localhost:5000/api/google/calendar/remove",
        { goalId },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Remove calendar failed");
    }
  }
);

