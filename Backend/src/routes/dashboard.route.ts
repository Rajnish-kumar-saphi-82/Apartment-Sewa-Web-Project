import { Router } from "express";
import { DashboardController } from "../controllers/dashboard.controller.js";
import { authorizedMiddleware, roleMiddleware } from "../middlewares/auth.middleware.js";
import { uploadDashboardImage } from "../middlewares/upload.middleware.js";
import { UserRole } from "../types/auth.type.js";

const router = Router();
const dashboardController = new DashboardController();

// Use authorizedMiddleware on all dashboard routes
router.use(authorizedMiddleware);

// Analytics
router.get("/analytics", roleMiddleware(UserRole.ADMIN, UserRole.OWNER), (req, res) => dashboardController.getAnalytics(req, res));

// Notices
router.get("/notices", (req, res) => dashboardController.getNotices(req, res));
router.post("/notices", roleMiddleware(UserRole.ADMIN, UserRole.OWNER), (req, res) => dashboardController.createNotice(req, res));
router.patch("/notices/:id", roleMiddleware(UserRole.ADMIN, UserRole.OWNER), (req, res) => dashboardController.updateNotice(req, res));
router.delete("/notices/:id", roleMiddleware(UserRole.ADMIN, UserRole.OWNER), (req, res) => dashboardController.deleteNotice(req, res));

// Units
router.get("/units", (req, res) => dashboardController.getUnits(req, res));
router.post("/units", roleMiddleware(UserRole.ADMIN, UserRole.OWNER), uploadDashboardImage.single("image"), (req, res) => dashboardController.createUnit(req, res));
router.patch("/units/:id/status", roleMiddleware(UserRole.ADMIN, UserRole.OWNER), (req, res) => dashboardController.updateUnitStatus(req, res));
router.delete("/units/:id", roleMiddleware(UserRole.ADMIN, UserRole.OWNER), (req, res) => dashboardController.deleteUnit(req, res));

// Tenants
router.get("/tenants", (req, res) => dashboardController.getTenants(req, res));
router.post("/tenants", roleMiddleware(UserRole.ADMIN, UserRole.OWNER), (req, res) => dashboardController.createTenant(req, res));

// Bills
router.get("/bills", (req, res) => dashboardController.getBills(req, res));
router.get("/bills/mine", (req, res) => dashboardController.getMyBills(req, res)); 
router.get("/bills/:id", (req, res) => dashboardController.getBillById(req, res));
router.post("/bills", roleMiddleware(UserRole.ADMIN, UserRole.OWNER), (req, res) => dashboardController.createBill(req, res));
router.patch("/bills/:id/pay", (req, res) => dashboardController.payBill(req, res)); 

// Maintenance Tickets
router.get("/tickets", (req, res) => dashboardController.getTickets(req, res));
router.post("/tickets", uploadDashboardImage.single("image"), (req, res) => dashboardController.createTicket(req, res)); // Tenants can create tickets
router.patch("/tickets/:id/status", roleMiddleware(UserRole.ADMIN, UserRole.OWNER), (req, res) => dashboardController.updateTicketStatus(req, res));
router.delete("/tickets/:id", roleMiddleware(UserRole.ADMIN, UserRole.OWNER), (req, res) => dashboardController.deleteTicket(req, res));

export default router;
