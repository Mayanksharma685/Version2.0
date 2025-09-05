import User from "../models/User.js";
import Attendance from "../models/Attendance.js";  // correct import

export const markAttendance = async (req, res) => {
  try {
    const { uuid } = req.user; // comes from JWT middleware

    // Find the user by uuid
    const user = await User.findOne({ uuid });
    if (!user) {
      return res.status(400).json({ status: "error", message: "User not found" });
    }

    // Create attendance record
    const record = new Attendance({
      student: user._id,
      markedBy: "student",
      status: "present",
    });

    await record.save();

    res.json({
      status: "success",
      message: "Attendance marked successfully",
      data: { email: user.email, last_seen: user.last_seen },
    });
  } catch (err) {
    console.error("Attendance error:", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

