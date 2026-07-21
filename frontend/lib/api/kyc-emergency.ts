import axiosInstance from "./axios-instance";
import { API } from "./endpoints";

//  KYC API 
export const submitKyc = (data: FormData) =>
  axiosInstance.post(API.KYC, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getMyKyc = () => axiosInstance.get(`${API.KYC}/mine`);

export const getAllKyc = () => axiosInstance.get(API.KYC);

export const reviewKyc = (id: string, status: "Approved" | "Rejected", reviewNote?: string) =>
  axiosInstance.patch(`${API.KYC}/${id}/review`, { status, reviewNote });

export const deleteKyc = (id: string) => axiosInstance.delete(`${API.KYC}/${id}`);

//  Emergency API 
export const getEmergencyContacts = () => axiosInstance.get(API.EMERGENCY);

export const getAllEmergencyContacts = () => axiosInstance.get(`${API.EMERGENCY}/all`);

export const createEmergencyContact = (data: any) => axiosInstance.post(API.EMERGENCY, data);

export const updateEmergencyContact = (id: string, data: any) =>
  axiosInstance.patch(`${API.EMERGENCY}/${id}`, data);

export const deleteEmergencyContact = (id: string) =>
  axiosInstance.delete(`${API.EMERGENCY}/${id}`);
