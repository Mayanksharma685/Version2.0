import express from "express";
import { markAttendance } from "../controllers/attendanceController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/mark-attendance", protect, markAttendance);

export default router;
