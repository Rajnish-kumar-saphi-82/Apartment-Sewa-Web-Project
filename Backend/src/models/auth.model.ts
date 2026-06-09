import mongoose, { Schema, Document } from "mongoose";
import { UserRole } from "../types/auth.type.js";

export interface IUser extends Document {
  full_name: string;
  email: string;
  password: string;
  role: UserRole;
  country_code: string;
  phone: string;
  is_verified: boolean;
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
    is_verified: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  },
);

export const UserModel = mongoose.model<IUser>("User", UserSchema);
