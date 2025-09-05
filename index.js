import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";   // centralized DB connection

// Routes
import authRoutes from "./routes/authRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import teacherRoutes from "./routes/teacherRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";   // NEW

dotenv.config();
const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/admin", adminRoutes);   // Admin routes added

// (Optional) Move deleteUserDevice into authRoutes instead of direct mount
// app.use("/api/delete", deleteUserDevice);  avoid direct controller binding

// Server + DB Connection
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
    process.exit(1); // exit process if DB fails
  });
