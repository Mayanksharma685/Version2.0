import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Attendance from "../models/Attendance.js";
import ImpersonationLog from "../models/ImpersonationLog.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// USER MANAGEMENT
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({ status: "success", count: users.length, data: users });
  } catch (err) {
    console.error("Get all users error:", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role });

    await user.save();

    // generate token for new user
    const token = jwt.sign(
      { id: user._id, email: user.email, uuid: user.uuid, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      status: "success",
      message: "User created",
      data: user,
      token,
    });
  } catch (err) {
    console.error("Create user error:", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ status: "success", message: "User updated", data: user });
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ status: "success", message: "User deleted" });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

// ATTENDANCE
export const markAttendanceAdmin = async (req, res) => {
  try {
    const { studentIds, status } = req.body;

    if (!studentIds || studentIds.length === 0) {
      return res.status(400).json({ message: "No students provided" });
    }

    const records = studentIds.map((id) => ({
      student: id,
      teacher: req.user.id,
      markedBy: "admin",
      status: status || "present",
      date: new Date(),
    }));

    const savedRecords = await Attendance.insertMany(records);

    res.json({
      status: "success",
      message: "Admin marked/overrode attendance",
      count: savedRecords.length,
      data: savedRecords,
    });
  } catch (err) {
    console.error("Admin attendance error:", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

export const getAllAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find()
      .populate("student", "name email role")
      .populate("teacher", "name email role");

    res.json({ status: "success", data: attendance });
  } catch (err) {
    console.error("Get attendance error:", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

// PASSWORD RESET
export const resetUserPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ status: "error", message: "Email and new password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ status: "error", message: "User not found" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({
      status: "success",
      message: `Password reset successfully for ${user.email}`,
    });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

//IMPERSONATION
export const impersonateUser = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ status: "error", message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, uuid: user.uuid, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    await ImpersonationLog.create({
      admin: req.user.id,
      impersonatedUser: user._id,
    });

    res.json({
      status: "success",
      message: `Admin impersonated ${user.role} - ${user.email}`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Impersonation error:", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

