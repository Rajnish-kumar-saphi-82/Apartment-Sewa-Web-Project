import { Router, Request, Response } from "express";
import { KycController, EmergencyController } from "../controllers/kyc-emergency.controller.js";
import { authorizedMiddleware, roleMiddleware } from "../middlewares/auth.middleware.js";
import { uploadDashboardImage } from "../middlewares/upload.middleware.js";
import { UserRole } from "../types/auth.type.js";

const router = Router();
const kycController = new KycController();
const emergencyController = new EmergencyController();

// KYC Routes 
// All KYC routes require login
router.get("/kyc/mine", authorizedMiddleware, (req: Request, res: Response) => kycController.getMyKyc(req, res));
router.post("/kyc", authorizedMiddleware, uploadDashboardImage.fields([
  { name: "documentFront", maxCount: 1 },
  { name: "documentBack", maxCount: 1 },
  { name: "selfie", maxCount: 1 },
  { name: "ownershipCert", maxCount: 1 },
]), (req: Request, res: Response) => kycController.submitKyc(req, res));
router.get("/kyc", authorizedMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.OWNER), (req: Request, res: Response) => kycController.getAllKyc(req, res));
router.patch("/kyc/:id/review", authorizedMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.OWNER), (req: Request, res: Response) => kycController.reviewKyc(req, res));
router.delete("/kyc/:id", authorizedMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.OWNER), (req: Request, res: Response) => kycController.deleteKyc(req, res));

//  Emergency Directory Routes 
// Public read (still requires login for security)
router.get("/emergency", authorizedMiddleware, (req: Request, res: Response) => emergencyController.getContacts(req, res));
// Admin-only management
router.get("/emergency/all", authorizedMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.OWNER), (req: Request, res: Response) => emergencyController.getAllContacts(req, res));
router.post("/emergency", authorizedMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.OWNER), (req: Request, res: Response) => emergencyController.createContact(req, res));
router.patch("/emergency/:id", authorizedMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.OWNER), (req: Request, res: Response) => emergencyController.updateContact(req, res));
router.delete("/emergency/:id", authorizedMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.OWNER), (req: Request, res: Response) => emergencyController.deleteContact(req, res));

export default router;
