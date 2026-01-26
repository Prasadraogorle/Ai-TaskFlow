import express from "express";
import { googleAuth, googleCallback } from "../controllers/googleAuth-controller.js";
import { addDailyTasksToCalendar, removeDailyTasksFromCalendar } from "../controllers/calendarController.js";
import { authMiddleware } from "../controllers/auth-controller.js";
import googleAuthMiddleware from "../middleware/googleAuthMiddleware.js";

const router = express.Router();

/* OAuth Flow — NO JWT */
router.get("/auth", googleAuth);
router.get("/callback", googleCallback);

/* Calendar APIs — JWT REQUIRED */
router.post("/calendar/add", authMiddleware, googleAuthMiddleware, addDailyTasksToCalendar);
router.post("/calendar/remove", authMiddleware, googleAuthMiddleware, removeDailyTasksFromCalendar);

export default router;
