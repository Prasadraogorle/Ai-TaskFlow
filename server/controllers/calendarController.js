import Goal from "../models/Goal.js";
import { google } from "googleapis";
import User from "../models/User.js";

/* ================================
   ADD DAILY TASKS TO CALENDAR
==================================*/
export const addDailyTasksToCalendar = async (req, res) => {
  try {
    const { goalId } = req.body;
    const userId = req.user.id;

    const goal = await Goal.findOne({ _id: goalId, userId });
    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found"
      });
    }

    const calendar = google.calendar({
      version: "v3",
      auth: req.oauth2Client
    });

    // Base start date = today
    // If you want fixed start: use goal.createdAt instead
    const baseDate = new Date();

    for (let groupIndex = 0; groupIndex < goal.dailyTasks.length; groupIndex++) {
      const group = goal.dailyTasks[groupIndex];

      // Ensure calendarEventIds array matches tasks length
      if (!group.calendarEventIds) group.calendarEventIds = [];
      if (group.calendarEventIds.length < group.tasks.length) {
        group.calendarEventIds.length = group.tasks.length;
      }

      for (let taskIndex = 0; taskIndex < group.tasks.length; taskIndex++) {

        // Skip already scheduled tasks
        if (group.calendarEventIds[taskIndex]) continue;

        const taskText = group.tasks[taskIndex];

        // 📅 Event date = baseDate + running index of all daily tasks
        const eventDate = new Date(baseDate);
        const dayOffset = groupIndex + taskIndex;
        eventDate.setDate(baseDate.getDate() + dayOffset);

        // Set fixed time (example: 9 AM)
        eventDate.setHours(9, 0, 0, 0);

        // End time = 30 minutes later
        const endDate = new Date(eventDate);
        endDate.setMinutes(endDate.getMinutes() + 30);

        // Insert event
        const event = await calendar.events.insert({
          calendarId: "primary",
          requestBody: {
            summary: taskText,
            description: `Goal: ${goal.goalTitle}`,
            start: { dateTime: eventDate.toISOString() },
            end: { dateTime: endDate.toISOString() },
            reminders: {
              useDefault: false,
              overrides: [{ method: "popup", minutes: 10 }]
            }
          }
        });

        // Save eventId in DB
        group.calendarEventIds[taskIndex] = event.data.id;
      }
    }

    await goal.save();

    return res.json({
      success: true,
      message: "Daily tasks scheduled on Google Calendar"
    });

  } catch (err) {
    const userId = req.user.id;

    console.error("Calendar Add Error:", err.response?.data || err.message);

    // If token expired or user revoked access
    if (
      err.response?.data?.error === "invalid_grant" ||
      err.response?.status === 401
    ) {
      await User.findByIdAndUpdate(userId, {
        googleTokens: null
      });

      return res.status(401).json({
        success: false,
        message: "Google Calendar disconnected. Please reconnect."
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to add tasks to calendar."
    });
  }
};



/* ================================
   REMOVE DAILY TASKS FROM CALENDAR
==================================*/
export const removeDailyTasksFromCalendar = async (req, res) => {
  try {
    const { goalId } = req.body;
    const userId = req.user.id;

    const goal = await Goal.findOne({ _id: goalId, userId });
    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found"
      });
    }

    const calendar = google.calendar({
      version: "v3",
      auth: req.oauth2Client
    });

    for (let group of goal.dailyTasks) {
      if (!group.calendarEventIds) continue;

      for (let i = 0; i < group.calendarEventIds.length; i++) {
        const eventId = group.calendarEventIds[i];
        if (!eventId) continue;

        await calendar.events.delete({
          calendarId: "primary",
          eventId
        });

        group.calendarEventIds[i] = null;
      }
    }

    await goal.save();

    return res.json({
      success: true,
      message: "Daily tasks removed from Google Calendar"
    });

  } catch (err) {
    console.error("Calendar Remove Error:", err.response?.data || err.message);

    return res.status(500).json({
      success: false,
      message: "Failed to remove tasks from calendar"
    });
  }
};
