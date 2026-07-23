import { Request, Response } from "express";
import { DashboardService } from "../services/dashboard.service.js";
import { ApiResponseHelper } from "../utils/apihelper.util.js";
import { UserModel } from "../models/auth.model.js";
import { analyzeMaintenanceImage } from "../services/gemini.service.js";
import { BillModel } from "../models/bill.model.js";
import { UnitModel } from "../models/unit.model.js";
import { 
  CreateNoticeDTO, CreateUnitDTO, UpdateUnitStatusDTO, 
  CreateTenantDTO, CreateBillDTO, PayBillDTO, 
  CreateTicketDTO, UpdateTicketStatusDTO 
} from "../dtos/dashboard.dto.js";

const dashboardService = new DashboardService();

export class DashboardController {
    async getAnalytics(req: Request, res: Response) {
        try {
            const analytics = await dashboardService.getAnalytics();
            return ApiResponseHelper.success(res, analytics, "Analytics fetched successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message, error.status ?? 500);
        }
    }

    // Notices
    async getNotices(req: Request, res: Response) {
        try {
            const notices = await dashboardService.getNotices();
            return ApiResponseHelper.success(res, notices, "Notices fetched successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message, error.status ?? 500);
        }
    }

    async getNoticeById(req: Request, res: Response) {
        try {
            const notice = await dashboardService.getNoticeById(req.params.id as string);
            return ApiResponseHelper.success(res, notice, "Notice fetched successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message, error.status ?? 500);
        }
    }
    
    async createNotice(req: Request, res: Response) {
        try {
            const data = CreateNoticeDTO.parse(req.body);
            // Auto-generate date so frontend doesn't need to send it
            const noticeData = {
                ...data,
                date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
            };
            const notice = await dashboardService.createNotice(noticeData as any);
            return ApiResponseHelper.success(res, notice, "Notice created successfully", 201);
        } catch (error: any) {
            if (error.errors) return ApiResponseHelper.validationError(res, error.errors);
            return ApiResponseHelper.error(res, error.message, error.status ?? 500);
        }
    }

    async updateNotice(req: Request, res: Response) {
        try {
            const notice = await dashboardService.updateNotice((req.params.id as string), req.body);
            return ApiResponseHelper.success(res, notice, "Notice updated successfully");
        } catch (error: any) {
            if (error.errors) return ApiResponseHelper.validationError(res, error.errors);
            return ApiResponseHelper.error(res, error.message, error.status ?? 500);
        }
    }

    async markNoticeRead(req: Request, res: Response) {
        try {
            const notice = await dashboardService.getNoticeById(req.params.id as string);
            return ApiResponseHelper.success(res, notice, "Notification marked as read");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message, error.status ?? 500);
        }
    }

    // Units
    async getUnits(req: Request, res: Response) {
        try {
            const units = await dashboardService.getUnits();
            return ApiResponseHelper.success(res, units, "Units fetched successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message, error.status ?? 500);
        }
    }

    async getUnitById(req: Request, res: Response) {
        try {
            const unit = await dashboardService.getUnitById(req.params.id as string);
            return ApiResponseHelper.success(res, unit, "Unit fetched successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message, error.status ?? 500);
        }
    }

    async createUnit(req: Request, res: Response) {
        try {
            const data = CreateUnitDTO.parse(req.body) as any;
            if (req.file) {
                data.image = `${req.protocol}://${req.get("host")}/uploads/dashboard/${req.file.filename}`;
            }
            const unit = await dashboardService.createUnit(data);
            return ApiResponseHelper.success(res, unit, "Unit created successfully", 201);
        } catch (error: any) {
            if (error.errors) return ApiResponseHelper.validationError(res, error.errors);
            return ApiResponseHelper.error(res, error.message, error.status ?? 500);
        }
    }

    async updateUnitStatus(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const data = UpdateUnitStatusDTO.parse(req.body);
            const unit = await dashboardService.updateUnitStatus(id, data as any);
            return ApiResponseHelper.success(res, unit, "Unit status updated successfully");
        } catch (error: any) {
            if (error.errors) return ApiResponseHelper.validationError(res, error.errors);
            return ApiResponseHelper.error(res, error.message, error.status ?? 500);
        }
    }

    async uploadApartmentPhotos(req: Request, res: Response) {
        try {
            if (!req.file) return ApiResponseHelper.error(res, "Image is required", 400);
            const image = `${req.protocol}://${req.get("host")}/uploads/dashboard/${req.file.filename}`;
            const unit = await dashboardService.updateUnit(req.params.id as string, { image });
            return ApiResponseHelper.success(res, unit, "Apartment photo uploaded successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message, error.status ?? 500);
        }
    }

    // Tenants
    async getTenants(req: Request, res: Response) {
        try {
            const tenants = await dashboardService.getTenants();
            return ApiResponseHelper.success(res, tenants, "Tenants fetched successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message, error.status ?? 500);
        }
    }

    async getTenantById(req: Request, res: Response) {
        try {
            const tenant = await dashboardService.getTenantById(req.params.id as string);
            return ApiResponseHelper.success(res, tenant, "Tenant fetched successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message, error.status ?? 500);
        }
    }

    async createTenant(req: Request, res: Response) {
        try {
            const data = CreateTenantDTO.parse(req.body);
            const tenant = await dashboardService.createTenant(data as any);
            return ApiResponseHelper.success(res, tenant, "Tenant created successfully", 201);
        } catch (error: any) {
            if (error.errors) return ApiResponseHelper.validationError(res, error.errors);
            return ApiResponseHelper.error(res, error.message, error.status ?? 500);
        }
    }

    // Bills
    async getBills(req: Request, res: Response) {
        try {
            const bills = await dashboardService.getBills();
            return ApiResponseHelper.success(res, bills, "Bills fetched successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message, error.status ?? 500);
        }
    }

    async getMyBills(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.userId;
            if (!userId) return ApiResponseHelper.error(res, "Unauthorized", 401);

            // Get the logged-in user's phone from auth DB
            const authUser = await UserModel.findById(userId).lean();
            if (!authUser?.phone && !authUser?.full_name) {
                return ApiResponseHelper.success(res, [], "No bills found");
            }
            const bills = await dashboardService.getMyBills(authUser.phone!, authUser.full_name!);
            return ApiResponseHelper.success(res, bills, "My bills fetched successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message, error.status ?? 500);
        }
    }

    async getBillById(req: Request, res: Response) {
        try {
            const bill = await dashboardService.getBillById((req.params.id as string));
            return ApiResponseHelper.success(res, bill, "Bill fetched successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message, error.status ?? 500);
        }
    }

    async createBill(req: Request, res: Response) {
        try {
            const data = CreateBillDTO.parse(req.body);
            const bill = await dashboardService.createBill(data as any);
            return ApiResponseHelper.success(res, bill, "Bill created successfully", 201);
        } catch (error: any) {
            if (error.errors) return ApiResponseHelper.validationError(res, error.errors);
            return ApiResponseHelper.error(res, error.message, error.status ?? 500);
        }
    }

    async payBill(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const data = PayBillDTO.parse(req.body);
            const userId = (req as any).user?.userId;
            if (!userId) return ApiResponseHelper.error(res, "Unauthorized", 401);
            const bill = await dashboardService.payBill(id, data as any, userId);
            return ApiResponseHelper.success(res, bill, "Bill paid successfully");
        } catch (error: any) {
            if (error.errors) return ApiResponseHelper.validationError(res, error.errors);
            return ApiResponseHelper.error(res, error.message, error.status ?? 500);
        }
    }

    // Tickets
    async getTickets(req: Request, res: Response) {
        try {
            const tickets = await dashboardService.getTickets();
            return ApiResponseHelper.success(res, tickets, "Tickets fetched successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message, error.status ?? 500);
        }
    }

    async getTicketById(req: Request, res: Response) {
        try {
            const ticket = await dashboardService.getTicketById(req.params.id as string);
            return ApiResponseHelper.success(res, ticket, "Ticket fetched successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message, error.status ?? 500);
        }
    }

    async createTicket(req: Request, res: Response) {
        try {
            const data = CreateTicketDTO.parse(req.body) as any;
            let diagnostic = "AI scanning pending. Processing components...";

            if (req.file) {
                data.image = `${req.protocol}://${req.get("host")}/uploads/dashboard/${req.file.filename}`;
                // Analyze image using Gemini AI
                diagnostic = await analyzeMaintenanceImage(req.file.path);
            }

            const ticket = await dashboardService.createTicket({ ...data, diagnostic });
            return ApiResponseHelper.success(res, ticket, "Ticket created successfully", 201);
        } catch (error: any) {
            if (error.errors) return ApiResponseHelper.validationError(res, error.errors);
            return ApiResponseHelper.error(res, error.message, error.status ?? 500);
        }
    }

    async updateTicketStatus(req: Request, res: Response) {
        try {
            const parsedData = UpdateTicketStatusDTO.safeParse(req.body);
            if (!parsedData.success) {
                return ApiResponseHelper.error(res, parsedData.error.issues[0].message, 400, parsedData.error.issues as any);
            }
            const ticket = await dashboardService.updateTicketStatus((req.params.id as string), parsedData.data as any);
            return ApiResponseHelper.success(res, ticket, "Ticket status updated");
        } catch (exception) {
            return this.handleError(res, exception);
        }
    }

    async deleteTicket(req: Request, res: Response) {
        try {
            await dashboardService.deleteTicket((req.params.id as string));
            return ApiResponseHelper.success(res, null, "Ticket deleted successfully");
        } catch (exception) {
            return this.handleError(res, exception);
        }
    }

    async deleteNotice(req: Request, res: Response) {
        try {
            await dashboardService.deleteNotice((req.params.id as string));
            return ApiResponseHelper.success(res, null, "Notice deleted successfully");
        } catch (exception) {
            return this.handleError(res, exception);
        }
    }

    async deleteUnit(req: Request, res: Response) {
        try {
            await dashboardService.deleteUnit((req.params.id as string));
            return ApiResponseHelper.success(res, null, "Unit deleted successfully");
        } catch (exception) {
            return this.handleError(res, exception);
        }
    }

    handleError(res: Response, exception: any) {
        const errorMessage = exception instanceof Error ? exception.message : "Unknown error";
        const errorStatus = exception?.status || 500;
        return ApiResponseHelper.error(res, errorMessage, errorStatus);
    }
}
