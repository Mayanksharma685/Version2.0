import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,       // removes spaces
      lowercase: true,  // normalizes email
    },

    password: {
      type: String,
      required: true,
    },

    uuid: {
      type: String,
      default: uuidv4,   // auto-generate unique UUID
      unique: true,
    },

    last_seen: {
      type: Date,
      default: null,    // updated on attendance marking
    },
    role: {
      type: String,
      enum: ["student", "teacher", "admin"],
      default: "student"
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);