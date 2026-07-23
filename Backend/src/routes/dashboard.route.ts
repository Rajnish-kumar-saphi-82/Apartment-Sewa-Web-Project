import { Router, Request, Response } from "express";
import { DashboardController } from "../controllers/dashboard.controller.js";
import { authorizedMiddleware, roleMiddleware } from "../middlewares/auth.middleware.js";
import { uploadDashboardImage } from "../middlewares/upload.middleware.js";
import { UserRole } from "../types/auth.type.js";

const router = Router();
const dashboardController = new DashboardController();

// Use authorizedMiddleware on all dashboard routes
router.use(authorizedMiddleware);

// --- Notices ---
router.get("/notices", (req: Request, res: Response) => dashboardController.getNotices(req, res));
router.post("/notices", roleMiddleware(UserRole.ADMIN, UserRole.OWNER), (req: Request, res: Response) => dashboardController.createNotice(req, res));
router.patch("/notices/:id", roleMiddleware(UserRole.ADMIN, UserRole.OWNER), (req: Request, res: Response) => dashboardController.updateNotice(req, res));
router.delete("/notices/:id", roleMiddleware(UserRole.ADMIN, UserRole.OWNER), (req: Request, res: Response) => dashboardController.deleteNotice(req, res));

// --- Units ---
router.get("/units", (req: Request, res: Response) => dashboardController.getUnits(req, res));
router.post("/units", roleMiddleware(UserRole.ADMIN, UserRole.OWNER), uploadDashboardImage.single("image"), (req: Request, res: Response) => dashboardController.createUnit(req, res));
router.patch("/units/:id/status", roleMiddleware(UserRole.ADMIN, UserRole.OWNER), (req: Request, res: Response) => dashboardController.updateUnitStatus(req, res));
router.delete("/units/:id", roleMiddleware(UserRole.ADMIN, UserRole.OWNER), (req: Request, res: Response) => dashboardController.deleteUnit(req, res));

// --- Tenants ---
router.get("/tenants", (req: Request, res: Response) => dashboardController.getTenants(req, res));
router.post("/tenants", roleMiddleware(UserRole.ADMIN, UserRole.OWNER), (req: Request, res: Response) => dashboardController.createTenant(req, res));

// --- Bills ---
router.get("/bills", (req: Request, res: Response) => dashboardController.getBills(req, res));
router.get("/bills/mine", (req: Request, res: Response) => dashboardController.getMyBills(req, res)); // Tenant fetches own bills
router.get("/bills/:id", (req: Request, res: Response) => dashboardController.getBillById(req, res));
router.post("/bills", roleMiddleware(UserRole.ADMIN, UserRole.OWNER), (req: Request, res: Response) => dashboardController.createBill(req, res));
router.patch("/bills/:id/pay", (req: Request, res: Response) => dashboardController.payBill(req, res)); // Allow tenant to pay bill

// --- Maintenance Tickets ---
router.get("/tickets", (req: Request, res: Response) => dashboardController.getTickets(req, res));
router.post("/tickets", uploadDashboardImage.single("image"), (req: Request, res: Response) => dashboardController.createTicket(req, res)); // Tenants can create tickets
router.patch("/tickets/:id/status", roleMiddleware(UserRole.ADMIN, UserRole.OWNER), (req: Request, res: Response) => dashboardController.updateTicketStatus(req, res));
router.delete("/tickets/:id", roleMiddleware(UserRole.ADMIN, UserRole.OWNER), (req: Request, res: Response) => dashboardController.deleteTicket(req, res));

export default router;
