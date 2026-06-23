import { z } from "zod";

export enum UserRole {
  ADMIN = "Admin",
  OWNER = "Owner",
  TENANT = "Tenant",
}

export const COUNTRY_CODES = [
  { code: "+977", short: "NP" },
  { code: "+91", short: "IN" },
  { code: "+1", short: "US" },
  { code: "+44", short: "UK" },
  { code: "+86", short: "CN" },
] as const;

// export const userSchema = z.object({
//   id: z.string().optional(),
//   full_name: z.string().min(3, "Full name must be at least 3 characters"),
//   email: z.string().email("Please enter a valid email address"),
//   password: z.string().min(6, "Password must be at least 6 characters"),
//   role: z.nativeEnum(UserRole),
//   country_code: z.enum(["+977", "+91", "+1", "+44", "+86"]),
//   phone: z
//     .string()
//     .regex(/^\d{6,15}$/, "Phone number must contain 6–15 digits"),
//   is_verified: z.boolean().default(false),
//   created_at: z.date().optional(),
//   updated_at: z.date().optional(),
// });

export const userSchema = z.object({
  id: z.string().optional(),
  full_name: z.string().min(3, "Full name must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.nativeEnum(UserRole),
  country_code: z.enum(["+977", "+91", "+1", "+44", "+86"]),
  phone: z
    .string()
    .regex(/^\d{6,15}$/, "Phone number must contain 6–15 digits"),
  profile_image: z.string().nullable().optional(),     // ← NEW
  is_verified: z.boolean().default(false),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

export type User = z.infer<typeof userSchema>;

export type UserWithoutPassword = Omit<User, "password">;

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    full_name: string;
    email: string;
    role: UserRole;
    country_code: string;
    phone: string;
  };
}
