// import { type User, UserRole } from "../types/auth.type.js";

// /**
//  * In-Memory User Storage
//  * Pre-populated with test accounts
//  * Note: Passwords are already hashed using bcrypt
//  */
// export const usersDataset: User[] = [
//   {
//     id: "1",
//     full_name: "Admin User",
//     email: "admin@apartment.com",
//     // Hashed password for "admin123"
//     password: "$2a$10$X8qJ9Z8KqZ8KqZ8KqZ8Kq.X8qJ9Z8KqZ8KqZ8KqZ8KqZ8KqZ8KqZ",
//     role: UserRole.ADMIN,
//     country_code: "+977",
//     phone: "9841234567",
//     is_verified: true,
//     created_at: new Date()
//   },
//   {
//     id: "2",
//     full_name: "John Owner",
//     email: "owner@apartment.com",
//     // Hashed password for "owner123"
//     password: "$2a$10$X8qJ9Z8KqZ8KqZ8KqZ8Kq.X8qJ9Z8KqZ8KqZ8KqZ8KqZ8KqZ8KqZ",
//     role: UserRole.OWNER,
//     country_code: "+977",
//     phone: "9841234568",
//     is_verified: true,
//     created_at: new Date()
//   },
//   {
//     id: "3",
//     full_name: "Jane Tenant",
//     email: "tenant@apartment.com",
//     // Hashed password for "tenant123"
//     password: "$2a$10$X8qJ9Z8KqZ8KqZ8KqZ8Kq.X8qJ9Z8KqZ8KqZ8KqZ8KqZ8KqZ8KqZ",
//     role: UserRole.TENANT,
//     country_code: "+977",
//     phone: "9841234569",
//     is_verified: true,
//     created_at: new Date()
//   }
// ];


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
      required: true
    },
    country_code: { type: String, required: true },
    phone: { type: String, required: true },
    is_verified: { type: Boolean, default: false }
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
  }
);

export const UserModel = mongoose.model<IUser>("User", UserSchema);