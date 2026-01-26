import User from "../models/User.js";
import { getOAuthClient } from "../config/google.js";

const googleClientMiddleware = async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user || !user.googleTokens) {
    return res.status(401).json({
      success: false,
      message: "Google Calendar not connected"
    });
  }

  req.oauth2Client = getOAuthClient(user.googleTokens);
  next();
};

export default googleClientMiddleware;
