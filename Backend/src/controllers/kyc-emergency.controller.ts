import { Request, Response } from "express";
import { ApiResponseHelper } from "../utils/apihelper.util.js";
import { KycRepository, EmergencyRepository } from "../repositories/kyc-emergency.repository.js";
import { UserModel } from "../models/auth.model.js";
import { z } from "zod";

const kycRepo = new KycRepository();
const emergencyRepo = new EmergencyRepository();

// Seed emergency contacts on first use
emergencyRepo.seedDefaultContacts().catch(console.error);

// ── KYC Controller ───────────────────────────────────────────────────────────
const SubmitKycDTO = z.object({
    documentType: z.enum(["Citizenship", "Passport", "Driver License", "National ID"]),
});

export class KycController {
    // Tenant submits KYC
    async submitKyc(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.userId;
            if (!userId) return ApiResponseHelper.error(res, "Unauthorized", 401);

            const parsed = SubmitKycDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, parsed.error.issues[0].message, 400);
            }

            const files = req.files as Record<string, Express.Multer.File[]> | undefined;
            const documentFront = files?.documentFront?.[0];
            const documentBack = files?.documentBack?.[0];
            const selfie = files?.selfie?.[0];
            const ownershipCert = files?.ownershipCert?.[0];

            if (!documentFront) {
                return ApiResponseHelper.error(res, "Document front file is required", 400);
            }
            if (!selfie) {
                return ApiResponseHelper.error(res, "Selfie file is required", 400);
            }

            const baseUrl = `${req.protocol}://${req.get("host")}/uploads/dashboard`;
            const kyc = await kycRepo.create({
                userId,
                documentType: parsed.data.documentType,
                documentFrontUrl: `${baseUrl}/${documentFront.filename}`,
                documentBackUrl: documentBack ? `${baseUrl}/${documentBack.filename}` : undefined,
                selfieUrl: `${baseUrl}/${selfie.filename}`,
                ownershipCertUrl: ownershipCert ? `${baseUrl}/${ownershipCert.filename}` : undefined,
                status: "Pending",
                submittedAt: new Date(),
            } as any);

            // Update User model kyc_status to pending
            await UserModel.findByIdAndUpdate(userId, { kyc_status: "pending" });

            return ApiResponseHelper.success(res, kyc, "KYC submitted successfully", 201);
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message, error.status ?? 500);
        }
    }

    // Tenant views own KYC submissions
    async getMyKyc(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.userId;
            if (!userId) return ApiResponseHelper.error(res, "Unauthorized", 401);

            const records = await kycRepo.findByUserId(userId);
            return ApiResponseHelper.success(res, records, "KYC records fetched");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message, error.status ?? 500);
        }
    }

    // Admin views all KYC submissions
    async getAllKyc(req: Request, res: Response) {
        try {
            const records = await kycRepo.getAll();
            return ApiResponseHelper.success(res, records, "All KYC records fetched");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message, error.status ?? 500);
        }
    }

    // Admin reviews (approve/reject) a KYC submission
    async reviewKyc(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const ReviewDTO = z.object({
                status: z.enum(["Approved", "Rejected"]),
                reviewNote: z.string().optional(),
            });

            const parsed = ReviewDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, parsed.error.issues[0].message, 400);
            }

            const updated = await kycRepo.updateStatus(id, parsed.data.status, parsed.data.reviewNote);
            if (!updated) return ApiResponseHelper.error(res, "KYC record not found", 404);

            // Update user kyc_status based on admin review
            const newKycStatus = parsed.data.status === "Approved" ? "approved" : "rejected";
            await UserModel.findByIdAndUpdate(updated.userId, { kyc_status: newKycStatus });

            return ApiResponseHelper.success(res, updated, `KYC ${parsed.data.status}`);
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message, error.status ?? 500);
        }
    }

    // Delete a KYC submission
    async deleteKyc(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            await kycRepo.deleteById(id);
            return ApiResponseHelper.success(res, null, "KYC record deleted");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message, error.status ?? 500);
        }
    }
}

// ── Emergency Controller ─────────────────────────────────────────────────────
const EmergencyDTO = z.object({
    category: z.enum(["Public Emergency", "Property Management", "Maintenance"]),
    name: z.string().min(1, "Name is required"),
    number: z.string().optional(),
    description: z.string().optional(),
    whatsapp: z.string().optional(),
    icon: z.string().optional(),
    sortOrder: z.number().optional(),
});

export class EmergencyController {
    // Everyone: view active emergency contacts
    async getContacts(req: Request, res: Response) {
        try {
            const contacts = await emergencyRepo.getAll();
            return ApiResponseHelper.success(res, contacts, "Emergency contacts fetched");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message, error.status ?? 500);
        }
    }

    // Admin: view all including inactive
    async getAllContacts(req: Request, res: Response) {
        try {
            const contacts = await emergencyRepo.getAllAdmin();
            return ApiResponseHelper.success(res, contacts, "All emergency contacts fetched");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message, error.status ?? 500);
        }
    }

    // Admin: create new contact
    async createContact(req: Request, res: Response) {
        try {
            const parsed = EmergencyDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, parsed.error.issues[0].message, 400);
            }
            const contact = await emergencyRepo.create(parsed.data as any);
            return ApiResponseHelper.success(res, contact, "Contact created", 201);
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message, error.status ?? 500);
        }
    }

    // Admin: update a contact
    async updateContact(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const parsed = EmergencyDTO.partial().safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, parsed.error.issues[0].message, 400);
            }
            const updated = await emergencyRepo.update(id, parsed.data as any);
            if (!updated) return ApiResponseHelper.error(res, "Contact not found", 404);
            
            return ApiResponseHelper.success(res, updated, "Contact updated");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message, error.status ?? 500);
        }
    }

    // Admin: delete a contact
    async deleteContact(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            await emergencyRepo.deleteById(id);
            return ApiResponseHelper.success(res, null, "Contact deleted");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message, error.status ?? 500);
        }
    }
}
