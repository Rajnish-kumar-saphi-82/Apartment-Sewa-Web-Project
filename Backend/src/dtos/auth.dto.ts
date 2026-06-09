import { z } from "zod";
import { UserRole } from "../types/auth.type.js";

export const RegisterDTO = z
  .object({
    userType: z.nativeEnum(UserRole, {
      message: "Please select a user type",
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
      message: "Please select a country code",
    }),
    phone: z
      .string()
      .min(1, "Phone number is required")
      .regex(/^\d{6,15}$/, "Phone number must contain 6–15 digits"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterDTO = z.infer<typeof RegisterDTO>;

export const LoginDTO = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export type LoginDTO = z.infer<typeof LoginDTO>;
