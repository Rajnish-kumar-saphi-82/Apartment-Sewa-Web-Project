import { z } from "zod";

// Notice DTO
export const CreateNoticeDTO = z.object({
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
});
export type CreateNoticeDTO = z.infer<typeof CreateNoticeDTO>;

// Unit DTO
export const CreateUnitDTO = z.object({
  flatNo: z.string().min(1, "Flat number is required"),
  floor: z.string().min(1, "Floor is required"),
  rent: z.coerce.number().positive("Rent must be a positive number"),
  image: z.string().url("Must be a valid URL").optional(),
});
export type CreateUnitDTO = z.infer<typeof CreateUnitDTO>;

export const UpdateUnitStatusDTO = z.object({
  status: z.enum(["Occupied", "Vacant"]),
  tenantName: z.string().optional(),
  tenantPhone: z.string().optional(),
});
export type UpdateUnitStatusDTO = z.infer<typeof UpdateUnitStatusDTO>;

// Tenant DTO
export const CreateTenantDTO = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  flatNo: z.string().min(1, "Flat number is required"),
});
export type CreateTenantDTO = z.infer<typeof CreateTenantDTO>;

// Bill DTO
export const CreateBillDTO = z.object({
  flatNo: z.string().min(1, "Flat number is required"),
  month: z.string().min(1, "Month is required"),
  rentCost: z.number().nonnegative(),
  electricityCost: z.number().nonnegative(),
  waterCost: z.number().nonnegative(),
  serviceCost: z.number().nonnegative(),
});
export type CreateBillDTO = z.infer<typeof CreateBillDTO>;

export const PayBillDTO = z.object({
  paymentMethod: z.string().min(1, "Payment method is required"),
});
export type PayBillDTO = z.infer<typeof PayBillDTO>;

// Ticket DTO
export const CreateTicketDTO = z.object({
  flatNo: z.string().min(1, "Flat number is required"),
  description: z.string().min(1, "Description is required"),
  image: z.string().url("Must be a valid URL").optional(),
});
export type CreateTicketDTO = z.infer<typeof CreateTicketDTO>;

export const UpdateTicketStatusDTO = z.object({
  status: z.enum(["Pending", "In Progress", "Fixed"]),
});
export type UpdateTicketStatusDTO = z.infer<typeof UpdateTicketStatusDTO>;
