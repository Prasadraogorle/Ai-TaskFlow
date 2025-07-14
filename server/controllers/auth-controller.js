const User = require('../models/User');
const jwt = require("jsonwebtoken");
const admin = require('firebase-admin');
require("dotenv").config();

admin.initializeApp({
  credential: admin.credential.cert({
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
    universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
  }),
});

/**
 * Register user (email/password)
 */
const registerUser = async (req, res) => {
  console.log("Register request body:", req.body);

  const { userName, email, password } = req.body;

  if (!password || password.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Password is required.",
    });
  }

  try {
    const check = await User.findOne({ email });
    if (check) {
      return res.status(400).json({
        success: false,
        message: "User already exists!",
      });
    }

    const newUser = new User({
      name: userName,
      email: email,
      password: password,
      authProvider: 'email',
      firebaseUid: undefined, // ✅ added this line
    });

    await newUser.save();

    return res.status(200).json({
      success: true,
      message: "Successfully registered",
      user: {
        id: newUser._id,
        email: newUser.email,
        userName: newUser.name,
        profilePicture: newUser.profilePicture,
        authProvider: newUser.authProvider,
      },
    });

  } catch (error) {
    console.error("Register User error:", error);

    res.status(500).json({
      success: false,
      message: "Some error occurred",
      error: error.message,
    });
  }
};


/**
 * Login with email/password
 */
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const checkUser = await User.findOne({ email });
    if (checkUser) {
      if (checkUser.password === password) {
        const token = jwt.sign(
          {
            id: checkUser._id,
            email: checkUser.email,
            userName: checkUser.name,
          },
          process.env.JWT_SECRET_KEY,
          { expiresIn: "60m" }
        );

        res.cookie("token", token, {
          httpOnly: true,
          secure: true,
          sameSite: 'None',
        }).json({
          success: true,
          message: "Logged in successfully",
          user: {
            id: checkUser._id,
            email: checkUser.email,
            userName: checkUser.name,
            profilePicture: checkUser.profilePicture,
            authProvider: checkUser.authProvider,
          },
        });
      } else {
        return res.json({
          success: false,
          message: "Invalid Password. Try again!",
        });
      }
    } else {
      return res.json({
        success: false,
        message: "User doesn't exist!",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Some error occurred",
      error,
    });
  }
};

/**
 * Google login
 */
const googleLogin = async (req, res) => {
  const { idToken, email, name, photoURL, uid } = req.body;

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    if (decodedToken.uid !== uid) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        name: name,
        email: email,
        password: 'GOOGLE_AUTH',
        firebaseUid: uid,
        profilePicture: photoURL,
        authProvider: 'google',
      });
      await user.save();
    } else {
      if (!user.firebaseUid) {
        user.firebaseUid = uid;
        user.authProvider = 'google';
        if (photoURL && !user.profilePicture) {
          user.profilePicture = photoURL;
        }
        await user.save();
      }
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        userName: user.name,
        firebaseUid: uid,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "60m" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
    }).json({
      success: true,
      message: "Logged in successfully with Google",
      user: {
        id: user._id,
        email: user.email,
        userName: user.name,
        profilePicture: user.profilePicture,
        authProvider: user.authProvider,
      },
    });

  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({
      success: false,
      message: "Google authentication failed",
    });
  }
};

/**
 * Logout
 */
const logoutUser = (req, res) => {
  res.clearCookie("token").json({
    success: true,
    message: "Logged out successfully!",
  });
};

/**
 * Auth Middleware
 */
const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized user!",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Unauthorized user!",
    });
  }
};

/**
 * Check Auth - new endpoint
 */
const checkAuth = async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No token. Unauthorized.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Authenticated",
      user: {
        id: user._id,
        email: user.email,
        userName: user.name,
        profilePicture: user.profilePicture,
        authProvider: user.authProvider,
      },
    });

  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  authMiddleware,
  googleLogin,
  checkAuth,
};
