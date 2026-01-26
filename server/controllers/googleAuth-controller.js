import User from "../models/User.js";
import { getOAuthClient } from "../config/google.js";

export const googleAuth = (req, res) => {
  const oauth2Client = getOAuthClient();

  const state = req.query.state; // already encoded JSON

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/calendar"],
    state // pass through unchanged
  });

  res.redirect(url);
};




export const googleCallback = async (req, res) => {
  try {
    const { code, state } = req.query;

    // Decode JSON
    const parsedState = JSON.parse(decodeURIComponent(state));
    const { userId, goalId } = parsedState;
    console.log(userId,goalId);
    
    const oauth2Client = getOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);

    await User.findByIdAndUpdate(userId, {
      googleTokens: tokens
    });

    // ✅ Redirect straight back to the goal page
    res.redirect(`http://localhost:5173/user/goal/${goalId}`);
  } catch (err) {
    console.error("Google callback error:", err);
    res.status(500).send("Google Authentication Failed");
  }
};

