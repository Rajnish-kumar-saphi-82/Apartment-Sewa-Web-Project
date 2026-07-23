import mongoose, { Schema, Document } from "mongoose";
import { UserRole } from "../types/auth.type.js";

export interface IUser extends Document {
  full_name: string;
  email: string;
  password: string;
  role: UserRole;
  country_code: string;
  phone: string;
  profile_image: string | null;
  verification_token: string | null;
  is_verified: boolean;
  kyc_status: "not_submitted" | "pending" | "approved" | "rejected";
  created_at: Date;
}

const UserSchema = new Schema<IUser>(
  {
    full_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
    },
    country_code: { type: String, required: true },
    phone: { type: String, required: true },
    profile_image: { type: String, default: null },
    verification_token: { type: String, default: null },
    is_verified: { type: Boolean, default: false },
    kyc_status: {
      type: String,
      enum: ["not_submitted", "pending", "approved", "rejected"],
      default: "not_submitted",
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  },
);

export const UserModel = mongoose.model<IUser>("User", UserSchema);
