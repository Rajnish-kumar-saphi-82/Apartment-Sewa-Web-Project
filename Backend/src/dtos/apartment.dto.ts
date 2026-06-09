import z from "zod";

export const createApartmentSchema = z.object({
    name: z.string().min(1),
    location: z.string().min(1),
    rentAmount: z.number().positive(),
});

export const assignTenantSchema = z.object({
    tenantId: z.string().min(1),
});