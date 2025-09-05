import express from "express";
import {
  markClassAttendance,
  getStudentsForClass,
  getClassAttendance,
} from "../controllers/teacherController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Teacher marks attendance for students
router.post("/mark-class", protect, authorizeRoles("teacher"), markClassAttendance);

// Teacher fetches list of students
router.get("/students", protect, authorizeRoles("teacher"), getStudentsForClass);

// Teacher views all attendance records they’ve marked
router.get("/attendance", protect, authorizeRoles("teacher"), getClassAttendance);


// router.get("/test", (req, res) => {
//   res.send("Teacher route is working!");
// });

export default router;
