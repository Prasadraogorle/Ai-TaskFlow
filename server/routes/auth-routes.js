import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  googleLogin,
  authMiddleware,
  deleteAccount,
  changePassword,
  refreshAccessToken
} from "../controllers/auth-controller.js";
import User from '../models/User.js';

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/google-login", googleLogin);
router.delete("/delete-account", authMiddleware, deleteAccount);
router.post("/setnewpassword", authMiddleware, changePassword);
router.post("/refresh", refreshAccessToken);

router.get("/check-auth", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Authenticated user!",
     user: {
      id: user._id,
      email: user.email,
      userName: user.name,
      profilePicture: user.profilePicture,
      authProvider: user.authProvider,
      role: user.role,
      googleConnected: !!user.googleTokens?.refresh_token
    }
    });
  } catch (error) {
    console.error(error);
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
});

export default router;