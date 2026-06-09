// import { email, z } from "zod";

// export const registerSchema = z.object({
//     fullName: z.string().min(1),
//     email:z.string().email(),
//     password: z.string().min(6),
//     role: z.enum(["ADMIN","OWNER","TENANT"]),
// });

// export const loginSchema = z.object({
//     email: z.string().email(),
//     password:z.string(),
// });



import { z } from "zod";
import { UserRole } from "../types/auth.type.js";

/**
 * Register DTO
 * IMPORTANT: Matches your frontend RegisterFormData exactly
 */
export const RegisterDTO = z
  .object({
    userType: z.nativeEnum(UserRole, {
      message: "Please select a user type"
    }),
    fullName: z
      .string()
      .min(1, "Full name is required")
      .min(3, "Full name must be at least 3 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    countryCode: z.enum(["+977", "+91", "+1", "+44", "+86"], {
      message: "Please select a country code"
    }),
    phone: z
      .string()
      .min(1, "Phone number is required")
      .regex(/^\d{6,15}$/, "Phone number must contain 6–15 digits"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password")
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });

export type RegisterDTO = z.infer<typeof RegisterDTO>;

/**
 * Login DTO
 * IMPORTANT: Matches your frontend LoginFormData exactly
 */
export const LoginDTO = z.object({
//   role: z.nativeEnum(UserRole, {
//     message: "Please select your access role"
//   }),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters")
});

export type LoginDTO = z.infer<typeof LoginDTO>;