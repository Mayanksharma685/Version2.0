import express from "express";
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  markAttendanceAdmin,
  getAllAttendance,
  impersonateUser,
  resetUserPassword,
} from "../controllers/adminController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import ImpersonationLog from "../models/ImpersonationLog.js";

const router = express.Router();

// USER MANAGEMENT Routes
router.get("/users", protect, authorizeRoles("admin"), getAllUsers);
router.post("/user", protect, authorizeRoles("admin"), createUser);
router.put("/user/:userId", protect, authorizeRoles("admin"), updateUser);
router.delete("/user/:userId", protect, authorizeRoles("admin"), deleteUser);

//ATTENDANCE Management By admin
router.post("/mark-class", protect, authorizeRoles("admin"), markAttendanceAdmin);
router.get("/attendance", protect, authorizeRoles("admin"), getAllAttendance);

// PASSWORD RESET
router.put("/reset-password", protect, authorizeRoles("admin"), resetUserPassword);

// IMPERSONATION 
router.post("/impersonate", protect, authorizeRoles("admin"), impersonateUser);

router.get("/impersonation-logs", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const logs = await ImpersonationLog.find()
      .populate("admin", "name email role")
      .populate("impersonatedUser", "name email role")
      .sort({ createdAt: -1 });

    res.json({ status: "success", count: logs.length, data: logs });
  } catch (err) {
    console.error("Get impersonation logs error:", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

export default router;
