import axiosInstance from "./axios-instance";
import { API } from "./endpoints";

export const getProfile = async () => {
  return axiosInstance.get(API.AUTH.WHOAMI);
};

export const updateProfile = async (data: FormData) => {
  return axiosInstance.put(API.AUTH.UPDATE, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const changePassword = async (data: any) => {
  return axiosInstance.put(API.AUTH.CHANGE_PASSWORD, data);
};
