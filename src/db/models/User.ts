import mongoose, { Model, Schema, Document } from "mongoose";

interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: "user" | "admin";
  isVerified: boolean;
  verificationCode?: string;
  verificationCodeExpiry?: Date;
  lastLogin?: Date;
  createdAt: Date;
}

const userSchema: Schema<IUser> = new Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    unique: true,
    trim: true,
    minlength: [4, "Username must be at least 4 characters long."],
    maxlength: [30, "Username must not exceed 30 characters."],
    match: [
      /^[a-zA-Z0-9@._-]+$/,
      "Username can only contain letters, numbers, @, -, _, and .",
    ],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format."],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    select: false,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationCode: {
    type: String,
    select: false,
  },
  verificationCodeExpiry: {
    type: Date,
    select: false,
  },
  lastLogin: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
