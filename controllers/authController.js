import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import User from "../models/User.js";

// Register (college-side)
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Login (assign uuid)
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Assign uuid if not already assigned
    if (!user.uuid) {
      user.uuid = uuidv4(); // generate uuid
      await user.save();
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, uuid: user.uuid },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      uuid: user.uuid,
      email: user.email
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete device sync (remove uuid but keep user)
export const deleteUserDevice = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    user.uuid = null;
    await user.save();

    res.json({ message: "Device sync removed successfully" });
  } catch (err) {
    console.error("Delete sync error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
