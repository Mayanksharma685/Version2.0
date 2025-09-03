import User from "../models/User.js";

export const markAttendance = async (req, res) => {
  try {
    const { uuid } = req.user; // comes from JWT middleware

    const user = await User.findOne({ uuid });
    if (!user) {
      return res.status(400).json({ status: "error", message: "User not found" });
    }

    user.last_seen = new Date();
    await user.save();

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
