import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import roadmapRoutes from "./routes/roadmap-routes.js"
import taskRoutes from './routes/taskRoutes.js';
import authRouter from './routes/auth-routes.js';
import feedbackRouter from './routes/feedback-routes.js';
import adminRouter from './routes/admin-routes.js';
import landingPageRouter from './routes/landingpage-routes.js';
import testimonialRouter from './routes/testimonial-routes.js';
import userDashboardRoutes from './routes/userDashboard-routes.js';
import loginHistory from './routes/loginHistory-routes.js';
import otpRoutes from './routes/otp-routes.js';
import googleRoutes from "./routes/googleRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_ORIGIN,
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/user',roadmapRoutes)
app.use('/api/tasks', taskRoutes);
app.use('/api/auth', authRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/admin', adminRouter);
app.use('/api/landing-page', landingPageRouter);
app.use('/api/testimonials', testimonialRouter);
app.use('/api/user-dashboard', userDashboardRoutes);
app.use('/api/loginHistory', loginHistory);
app.use('/api/otp', otpRoutes);
app.use("/api/google", googleRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch((err) => {
    console.error(err);
  });

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});