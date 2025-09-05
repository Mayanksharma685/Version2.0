import express from "express";
import { markAttendance } from "../controllers/attendanceController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";


const router = express.Router();

// Student self-marking
router.post("/mark-attendance", protect, authorizeRoles("student"), markAttendance);

export default router;
