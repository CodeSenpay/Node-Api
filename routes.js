import cookieParser from "cookie-parser";
import { Router } from "express";
import {
  getUserDataController,
  loginAdminController,
  loginStudentController,
  logoutStudentController,
  logoutUserController,
  sendOtp,
  verifyJwt,
  verifyOtpController,
} from "./controllers/login-controller.js";
import { register } from "./controllers/register-controller.js";
import { handle_schedule } from "./controllers/schedule-main-controller.js";
import { authenticate } from "./middleware/middleware.js";
import {
  generateSchoolYear,
  generateSemester,
  handleUploadStudentProfile,
} from "./services/utility.js";

const router = Router();

router.use(cookieParser());

// ==================== AUTH ROUTES ====================
router.post("/api/login-admin", loginAdminController);
router.post("/api/login-student", loginStudentController);
router.post("/api/logout/user", logoutUserController);
router.post("/api/logout/student", logoutStudentController);
router.get("/api/auth/verify-jwt", verifyJwt);
router.post("/api/auth/get-user-data", getUserDataController);

// ==================== OTP ROUTES =====================
router.post("/api/send-otp", sendOtp);
router.post("/api/verify-otp", verifyOtpController);

// ==================== REGISTRATION ROUTES =============
router.post("/api/register", register);

// ==================== SCHEDULING/REPORTING ROUTES =====
router.post("/api/scheduling-system/admin", authenticate, handle_schedule);
router.post("/api/scheduling-system/user", handle_schedule);
router.get("/api/reporting-system", authenticate, handle_schedule);
router.post("/api/jrmsu/college-departments", handle_schedule);

// ==================== UTILITY ROUTES ==================
router.post("/api/upload", handleUploadStudentProfile());
router.get("/api/utility/school-year", (req, res) => {
  res.json({ schoolYear: generateSchoolYear() });
});
router.get("/api/utility/semester", (req, res) => {
  res.json({ semester: generateSemester() });
});

export default router;
