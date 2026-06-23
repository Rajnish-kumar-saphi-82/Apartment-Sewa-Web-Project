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

export const UpdateProfileDTO = z.object({
  fullName: z
    .string()
    .min(3, "Full name must be at least 3 characters")
    .optional(),
  email: z
    .string()
    .email("Please enter a valid email address")
    .optional(),
  phone: z
    .string()
    .regex(/^\d{6,15}$/, "Phone number must contain 6–15 digits")
    .optional(),
});

export type UpdateProfileDTO = z.infer<typeof UpdateProfileDTO>;


export const ChangePasswordDTO = z.object({
  currentPassword: z
    .string()
    .min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(1, "New password is required")
    .min(6, "New password must be at least 6 characters"),
  confirmNewPassword: z
    .string()
    .min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Passwords do not match",
  path: ["confirmNewPassword"],
});

export type ChangePasswordDTO = z.infer<typeof ChangePasswordDTO>;