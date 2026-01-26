import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from './auth/index.js'; 
import taskReducer from './task/index.js';
import feedbackReducer from './feedback/index.js';
import adminReducer from './admin/index.js'
import statsReducer from './landing-page/index.js'; 
import testimonialReducer from './testimonials.js/index.js'
import dashboardReducer from './user-dashboard/index.js';
import loginHistoryReducer from './recent-login/index.js';
import otpReducer from './otp/index.js'
import roadmapReducer from "./roadmap/index.js"
import { googleReducer } from "./google/index.js";

const rootReducer = combineReducers({
  stats: statsReducer,
  auth: authReducer,
  task:taskReducer,
  feedback: feedbackReducer,
  admin: adminReducer,
  testimonials:testimonialReducer,
  dashboard:dashboardReducer,
  loginHistory:loginHistoryReducer,
  otp: otpReducer,
  roadmap:roadmapReducer,
  google: googleReducer
});

const store = configureStore({
  reducer: rootReducer,
});

export default store;
