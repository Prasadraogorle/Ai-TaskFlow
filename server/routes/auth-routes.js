const express = require('express');
const {
  registerUser,
  loginUser,
  logoutUser,
  googleLogin,
  authMiddleware
} = require("../controllers/auth-controller");
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/google-login", googleLogin);

router.get("/check-auth", authMiddleware, async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token. Unauthorized.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const user = await User.findById(decoded.id);

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
      },
    });
  } catch (error) {
    console.error(error);
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
});

module.exports = router;
