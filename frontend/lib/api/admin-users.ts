import axiosInstance from "./axios-instance";
import { API } from "./endpoints";

export type AdminUserRole = "Admin" | "Owner" | "Tenant";

export interface AdminUser {
  _id: string;
  full_name: string;
  email: string;
  role: AdminUserRole;
  country_code: string;
  phone: string;
  is_verified: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AdminUsersMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminUserPayload {
  full_name: string;
  email: string;
  password?: string;
  role: AdminUserRole;
  country_code: string;
  phone: string;
  is_verified: boolean;
}

export const getAdminUsers = async (params: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  const response = await axiosInstance.get(API.ADMIN.USERS, { params });
  return response.data as {
    data: AdminUser[];
    meta: AdminUsersMeta;
    message: string;
  };
};

export const getAdminUserById = async (id: string) => {
  const response = await axiosInstance.get(`${API.ADMIN.USERS}/${id}`);
  return response.data;
};

export const createAdminUser = async (data: AdminUserPayload) => {
  const response = await axiosInstance.post(API.ADMIN.USERS, data);
  return response.data;
};

export const updateAdminUser = async (
  id: string,
  data: Omit<AdminUserPayload, "password">,
) => {
  const response = await axiosInstance.patch(`${API.ADMIN.USERS}/${id}`, data);
  return response.data;
};

export const deleteAdminUser = async (id: string) => {
  const response = await axiosInstance.delete(`${API.ADMIN.USERS}/${id}`);
  return response.data;
};
