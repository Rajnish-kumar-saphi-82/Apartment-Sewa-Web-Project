import axiosInstance from "./axios-instance";
import { API } from "./endpoints";

// Notices 
export const getNotices = () => axiosInstance.get(API.DASHBOARD.NOTICES);
export const createNotice = (data: any) => axiosInstance.post(API.DASHBOARD.NOTICES, data);
export const deleteNotice = (id: string) => axiosInstance.delete(`${API.DASHBOARD.NOTICES}/${id}`);

// Units 
export const getUnits = () => axiosInstance.get(API.DASHBOARD.UNITS);
export const createUnit = (data: any) => {
  const config = data instanceof FormData ? { headers: { "Content-Type": "multipart/form-data" } } : {};
  return axiosInstance.post(API.DASHBOARD.UNITS, data, config);
};
export const updateUnitStatus = (id: string, data: { status: string; tenantName?: string; tenantPhone?: string }) => axiosInstance.patch(`${API.DASHBOARD.UNITS}/${id}/status`, data);
export const deleteUnit = (id: string) => axiosInstance.delete(`${API.DASHBOARD.UNITS}/${id}`);

// Tenants 
export const getTenants = () => axiosInstance.get(API.DASHBOARD.TENANTS);
export const createTenant = (data: any) => axiosInstance.post(API.DASHBOARD.TENANTS, data);

// Bills 
export const getBills = () => axiosInstance.get(API.DASHBOARD.BILLS);
export const getMyBills = () => axiosInstance.get(`${API.DASHBOARD.BILLS}/mine`);
export const createBill = (data: any) => axiosInstance.post(API.DASHBOARD.BILLS, data);
export const payBill = (id: string, paymentMethod: string) => axiosInstance.patch(`${API.DASHBOARD.BILLS}/${id}/pay`, { paymentMethod });

// Tickets 
export const getTickets = () => axiosInstance.get(API.DASHBOARD.TICKETS);
export const createTicket = (data: any) => {
  const config = data instanceof FormData ? { headers: { "Content-Type": "multipart/form-data" } } : {};
  return axiosInstance.post(API.DASHBOARD.TICKETS, data, config);
};
export const updateTicketStatus = (id: string, status: string) => axiosInstance.patch(`${API.DASHBOARD.TICKETS}/${id}/status`, { status });
export const deleteTicket = (id: string) => axiosInstance.delete(`${API.DASHBOARD.TICKETS}/${id}`);
