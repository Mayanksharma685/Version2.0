import mongoose from "mongoose";

const impersonationLogSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    impersonatedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const ImpersonationLog = mongoose.model("ImpersonationLog", impersonationLogSchema);
export default ImpersonationLog;
