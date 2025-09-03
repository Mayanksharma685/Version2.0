import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";   // centralized DB connection
import authRoutes from "./routes/authRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import { deleteUserDevice } from "./controllers/authController.js";

dotenv.config();
const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/delete", deleteUserDevice);

// Server + DB Connection
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error(" MongoDB connection failed:", err);
    process.exit(1); // exit process if DB fails
  });
