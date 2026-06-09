
"use client";

// import { useForm } from "react-hook-form";

// import { zodResolver } from "@hookform/resolvers/zod";

// import {
//   registerSchema,
//   RegisterFormData,
// } from "@/app/schemas/register.schema";

// export default function useRegisterForm() {

//   const {
//     register,
//     handleSubmit,
//     formState: { errors, isSubmitting },
//   } = useForm<RegisterFormData>({
//     resolver: zodResolver(registerSchema),

//     defaultValues: {
//       fullName: "",
//       email: "",
//       password: "",
//       confirmPassword: "",
//     },
//   });

//   const onSubmit = async (data: RegisterFormData) => {

//     alert(
//       `Name: ${data.fullName}
// Email: ${data.email}`
//     );
//   };

//   return {
//     register,
//     handleSubmit,
//     errors,
//     isSubmitting,
//     onSubmit,
//   };
// }

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  registerSchema,
  RegisterFormData,
} from "@/app/schemas/register.schema";
import router, { useRouter } from "next/router";
import { registerUser } from "@/lib/api/auth";
/**
 * useRegisterForm — owns ALL state for the register page:
 *   • react-hook-form registration & validation
 *   • showPassword / showConfirmPassword toggles
 *   • userType watcher + setter (so we can highlight the toggle button)
 *
 * The form fields it manages:
 *   userType, fullName, email, countryCode, phone, password, confirmPassword
 */
export default function useRegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      userType: "Owner",
      fullName: "",
      email: "",
      countryCode: "+977",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });
  // Watch values so the UI can react to them
  const userType = watch("userType");
  const countryCode = watch("countryCode");
  const phone = watch("phone");

// const router = useRouter();

  const onSubmit = async (data: RegisterFormData) => {
    try {
    const result = await registerUser(data);

    if (result.success) {
      router.push("/login");
    }
  } catch (error: any) {
    alert(error.message || "Registration failed");
  }
  
    const phoneNumber = `${data.countryCode}${data.phone.trim()}`;
    alert(
      `Registered ✅\n\n` +
        `Role: ${data.userType}\n` +
        `Name: ${data.fullName}\n` +
        `Email: ${data.email}\n` +
        `Phone: ${phoneNumber}`
    );
  };
  return {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    onSubmit,
    // Password visibility
    showPassword,
    toggleShowPassword: () => setShowPassword((s) => !s),
    showConfirmPassword,
    toggleShowConfirmPassword: () => setShowConfirmPassword((s) => !s),
    // User-type toggle (manually controlled because it's a button, not an input)
    userType,
    setUserType: (v: "Owner" | "Tenant") =>
      setValue("userType", v, { shouldValidate: true }),
    // Phone live-preview values
    countryCode,
    phone,
  };
}