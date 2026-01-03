import jwt from "jsonwebtoken";
import logger from "../middleware/logger.js";
import pool from "../config/db.conf.js";
import {
  getUserData,
  loginAdmin,
  loginStudent,
  logoutStudent,
  logoutUser,
  sendOtpToEmail,
  verifyOtp,
} from "../models/login-model.js";

const JWT_SECRET = process.env.JWT_SECRET;

async function loginAdminController(req, res) {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "No data provided." });
  }

  try {
    const { email, password } = req.body;
    const response = await loginAdmin({ email, password });

    // If the SP returns a status and it's not 200, handle accordingly
    if (response.user && response.user.status && response.user.status !== 200) {
      return res.status(response.user.status).json({ success: false, message: response.user.message });
    }
    if (!response.success) {
      return res.status(response.status || 401).json({
        success: false,
        message: response.message || "Invalid credentials.",
      });
    }

    const userId = response.user.user_id;
    const userLevel = response.user.user_level;
    const token = jwt.sign({ userId, userLevel }, JWT_SECRET, {
      expiresIn: "8h",
    });

    // If a token already exists, clear it before setting a new one
    if (req.cookies && req.cookies.token) {
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
    }

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 8 * 60 * 60 * 1000, // 8 hours
    });


    return res.json({ success: true, user: response.user });
  } catch (error) {
    console.error("Login error:", error);
    if (!res.headersSent) {
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
}

async function loginStudentController(req, res) {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "No data provided." });
  }

  try {
    const { studentId, password } = req.body;
    const response = await loginStudent({ studentId, password });

    // console.log("Login Response:", response);
    // Check if login was unsuccessful
    if (!response.success) {
      return res.status(response.status || 401).json({
        success: false,
        message: response.message || "Invalid credentials.",
      });
    }

    // Check if is_allowed is 0 (not allowed to login)
    if (typeof response.is_allowed !== "undefined" && response.is_allowed === 0) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to login at this time.",
      });
    }

    const student_id = response.user.student_id;
    const userLevel = response.user.user_level;
    const token = jwt.sign({ student_id, userLevel }, JWT_SECRET, {
      expiresIn: "8h",
    });

    // If a token already exists, clear it before setting a new one
    if (req.cookies && req.cookies.token) {
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
    }

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 8 * 60 * 60 * 1000, // 8 hours
    });

    return res.json({ success: true, user: response.user });
  } catch (error) {
    console.error("Login error:", error);
    if (!res.headersSent) {
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
}

async function logoutUserController(req, res) {
  try {
    logger(
      {
        action: "logout",
        user_id: req.body.user_id || "none",
        details: `User logout attempt`,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      },
      req
    );

    // Use the logoutUser function from the model
    return await logoutUser(res, req.body.user_id || null);
  } catch (error) {
    console.error("Logout error:", error);
    if (!res.headersSent) {
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
}

async function logoutStudentController(req, res) {
  try {
    if (req.session && req.session.user) {
      await pool.query("UPDATE students_tbl SET is_active = 0 WHERE student_id = ?", [req.session.user.id]);
      req.session.destroy(() => {
        return logoutStudent(res);
      });
    } else {
      return logoutStudent(res);
    }
  } catch (error) {
    console.error("Logout error:", error);
    if (!res.headersSent) {
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
}

async function sendOtp(req, res) {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email is required." });
  }

  try {
    const otpResponse = await sendOtpToEmail(email);
    if (otpResponse.success) {
      return res.json({ success: true, message: "OTP sent to email." });
    } else {
      return res.status(otpResponse.status || 500).json({
        success: false,
        message: otpResponse.message || "Failed to send OTP.",
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

async function verifyOtpController(req, res) {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res
      .status(400)
      .json({ success: false, message: "Email and OTP are required." });
  }

  try {
    const result = await verifyOtp(email, otp);
    // console.log("Verify OTP Result:", result[0][0].result)

    const verifyResult = result[0][0].result;

    if (verifyResult?.status === 200) {
      return res.json({ success: true, message: "OTP verified successfully." });
    } else {
      return res.status(401).json({
        success: false,
        message: verifyResult?.message || "Invalid OTP.",
      });
    }
  } catch (error) {
    console.error("OTP verification error:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}

const verifyJwt = async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.json({
      success: false,
      message: "Unauthorized access. No token provided.",
    });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.json({ success: true, user: decoded });
  } catch (error) {
    // If token is expired, update is_active to 0 in the database
    if (error.name === "TokenExpiredError") {
      try {
        // Decode the token without verifying signature to get userId
        const decoded = jwt.decode(token);
        if (decoded && decoded.userId) {
          await pool.query("UPDATE users_tbl SET is_active = 0 WHERE user_id = ?", [decoded.userId]);
        }
      } catch (dbError) {
        // Optionally log dbError
      }
    }
    return res.status(401).json({
      success: false,
      message: "Unauthorized access. Invalid token.",
      error: error,
    });
  }
};

const getUserDataController = async (req, res) => {
  // console.log(req.body);
  const id = req.body.id;

  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: "User ID or Student ID is required." });
  }

  try {
    const result = await getUserData(id);
    if (!result.success) {
      return res
        .status(404)
        .json({ success: false, message: result.message || "User not found." });
    }
    res.json(result);
  } catch (error) {
    console.error("Get user data error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export {
  getUserDataController,
  loginAdminController,
  loginStudentController,
  logoutStudentController,
  logoutUserController,
  sendOtp,
  verifyJwt,
  verifyOtpController,
};
