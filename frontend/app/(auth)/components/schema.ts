import z, { email } from "zod";

export const registerSchema = z
  .object({
    userType: z.enum(["Owner", "Tenant"], {
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
export type RegisterFormData = z.infer<typeof registerSchema>;
/**
 * Country-code list — shared between the schema and the form UI.
 * (Mirrors the Flutter mobile app's `_countryCodes` list.)
 */
export const COUNTRY_CODES = [
  { code: "+977", short: "NP" },
  { code: "+91", short: "IN" },
  { code: "+1", short: "US" },
  { code: "+44", short: "UK" },
  { code: "+86", short: "CN" },
] as const;

// export const loginSchema = z.object({
// email:z.email(),
// password:z.string().min(6),
// });

export const loginSchema = z.object({
  // role: z.enum(["Tenant", "Owner", "Admin"], {
  //   message: "Please select your access role",
  // }),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});
export type LoginFormData = z.infer<typeof loginSchema>;
