import { createSlice } from "@reduxjs/toolkit";
import {
  connectGoogleCalendar,
  addTasksToCalendar,
  removeTasksFromCalendar
} from "./googleThunks";

const initialState = {
  loading: false,
  successMessage: null,
  error: null
};

const googleSlice = createSlice({
  name: "google",
  initialState,
  reducers: {
    clearGoogleStatus: (state) => {
      state.loading = false;
      state.successMessage = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder

      // Connect
      .addCase(connectGoogleCalendar.pending, (state) => {
        state.loading = true;
      })
      .addCase(connectGoogleCalendar.fulfilled, (state) => {
        state.loading = false;
      })

      // Add Tasks
      .addCase(addTasksToCalendar.pending, (state) => {
        state.loading = true;
      })
      .addCase(addTasksToCalendar.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(addTasksToCalendar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Remove Tasks
      .addCase(removeTasksFromCalendar.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeTasksFromCalendar.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(removeTasksFromCalendar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearGoogleStatus } = googleSlice.actions;
export default googleSlice.reducer;
