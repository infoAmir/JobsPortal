import mongoose, { Types } from "mongoose";
const userSchema = new mongoose.Schema(
  {
    FullName: {
      type: String,
      required: true,
    },
    email: {
      required: true,
      type: String,
      unique: true,
    },
    PhoneNumber: {
      required: true,
      type: Number,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "recruiter"],
      required: true,
    },
    Profile: {
      bio: { type: String },
      skill: { type: String },
      resume: { type: String },
      ResumeOriginalName: { type: String },
      componay: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
      ProfilePhoto: { type: String, default: "" },
    },
  },
  { timestamps: true },
);

export const User = mongoose.model("User", userSchema);
