// export type Role = "ADMIN" | "OWNER" | "TENANT";

// export interface User{
//     id: string;
//     fullName:string;
//     email:string;
//     password: string;
//     role: Role;
// }


import { z } from "zod";

/**
 * User Roles Enum
 * IMPORTANT: Must match frontend exactly (Tenant, Owner, Admin)
 */
export enum UserRole {
  ADMIN = "Admin",
  OWNER = "Owner",
  TENANT = "Tenant"
}

/**
 * Country Codes (matches frontend COUNTRY_CODES)
 */
export const COUNTRY_CODES = [
  { code: "+977", short: "NP" },
  { code: "+91", short: "IN" },
  { code: "+1", short: "US" },
  { code: "+44", short: "UK" },
  { code: "+86", short: "CN" }
] as const;

/**
 * User Validation Schema
 */
export const userSchema = z.object({
  id: z.string().optional(),
  full_name: z.string().min(3, "Full name must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.nativeEnum(UserRole),
  country_code: z.enum(["+977", "+91", "+1", "+44", "+86"]),
  phone: z.string().regex(/^\d{6,15}$/, "Phone number must contain 6–15 digits"),
  is_verified: z.boolean().default(false),
  created_at: z.date().optional(),
  updated_at: z.date().optional()
});

/**
 * User Type (TypeScript interface)
 */
export type User = z.infer<typeof userSchema>;

/**
 * User Without Password (for responses)
 */
export type UserWithoutPassword = Omit<User, "password">;

/**
 * JWT Payload Interface
 * Data stored inside JWT token
 */
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

/**
 * Login Response Interface
 * Matches frontend expectations
 */
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