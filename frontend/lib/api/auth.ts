// lib/api/api/auth.ts
import axiosInstance from "./axios-instance";
import { API } from "./endpoints";

export const register = async (data: any) => {
  try {
    const response = await axiosInstance.post(API.AUTH.REGISTER, data);
    return response.data;
  } catch (error: Error | any) {
    throw new Error(error?.response?.data?.message || "Registration failed");
  }
};

export const login = async (data: any) => {
  try {
    const response = await axiosInstance.post(API.AUTH.LOGIN, data);
    return response.data;
  } catch (error: Error | any) {
    throw new Error(error?.response?.data?.message || "LOGIN failed");
  }
};
