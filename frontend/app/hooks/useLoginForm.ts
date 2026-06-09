"use client"

import { useState } from "react";

// export default function useLoginForm() {

//     const [email, setEmail] = useState("");

//     const [password, setPassword] = useState("");

//     return {
//         email,
//         setEmail,
//         password,
//         setPassword,
//     }
// }

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormData } from "@/app/schemas/login.schema";
import router, { useRouter } from "next/router";
import { loginUser } from "@/lib/api/auth";
/**
 * useLoginForm — manages every piece of state on the login page:
 *   • react-hook-form registration & validation
 *   • showPassword toggle for the eye icon
 *   • the onSubmit handler called after validation passes
 */
export default function useLoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // const router = useRouter();
  const onSubmit = async (data: LoginFormData) => {
  try {
    const result = await loginUser(data);

    if (result.success) {
      localStorage.setItem("token", result.data.token);
      router.push("/dashboard");
    }
  } catch (error: any) {
    alert(error.message || "Login failed");
  }
  };
  return {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    onSubmit,
    showPassword,
    toggleShowPassword: () => setShowPassword((s) => !s),
  };
}